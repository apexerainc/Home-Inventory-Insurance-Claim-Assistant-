import { GoogleGenerativeAI } from "@google/generative-ai"

// Helper function to convert File to base64
async function fileToGenerativeAIPart(file: File) {
  const data = await file.arrayBuffer()
  return {
    inlineData: {
      data: Buffer.from(data).toString("base64"),
      mimeType: file.type,
    },
  }
}

// Helper function to clean text
function cleanText(text: string) {
  return text
    .replace(/^[*•-]\s*/gm, "") // Remove stars, bullets, or dashes at start of lines
    .replace(/^\s*[\d]+\.\s*/gm, "") // Remove numbered lists
    .trim()
}

// Helper function to attempt to extract structured data from text
function parseAnalysisText(text: string) {
  // Clean the text first
  const cleanedText = cleanText(text)

  // First try parsing as JSON
  try {
    return JSON.parse(cleanedText)
  } catch (e) {
    // If JSON parsing fails, try to extract information using regex
    const items = []
    const lines = cleanedText.split("\n")
    let currentItem: { item?: string; description?: string; estimatedPrice?: string } = {}

    for (const line of lines) {
      const cleanLine = line.trim()
      if (!cleanLine) continue // Skip empty lines

      if (cleanLine.toLowerCase().startsWith("item:") || cleanLine.toLowerCase().startsWith("name:")) {
        if (currentItem.item) {
          items.push({ ...currentItem })
          currentItem = {}
        }
        currentItem.item = cleanLine.split(":")[1]?.trim()
      } else if (cleanLine.toLowerCase().startsWith("description:")) {
        currentItem.description = cleanLine.split(":")[1]?.trim()
      } else if (
        cleanLine.toLowerCase().startsWith("price:") ||
        cleanLine.toLowerCase().startsWith("estimated price:") ||
        cleanLine.toLowerCase().startsWith("cost:")
      ) {
        currentItem.estimatedPrice = cleanLine.split(":")[1]?.trim()
        if (Object.keys(currentItem).length >= 3) {
          items.push({ ...currentItem })
          currentItem = {}
        }
      }
    }

    // Add the last item if it exists
    if (currentItem.item) {
      items.push(currentItem)
    }

    return items.length > 0 ? items : null
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured")
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return Response.json({ error: "No image file provided" }, { status: 400 })
    }

    if (!imageFile.type.startsWith("image/")) {
      return Response.json({ error: "Invalid file type. Please upload an image." }, { status: 400 })
    }

    if (imageFile.size > 4 * 1024 * 1024) {
      return Response.json({ error: "File size too large. Maximum size is 4MB." }, { status: 400 })
    }

    try {
      const imagePart = await fileToGenerativeAIPart(imageFile)

      const prompt = `
        Analyze this image and list all visible items with their details.
        For each item provide the following information in exactly this format without any bullets, stars, or numbers:

        Item: [item name]
        Description: [brief description]
        Estimated Price: [price range in USD]

        Example:
        Item: Leather Sofa
        Description: Brown leather 3-seater sofa with tufted back
        Estimated Price: $800-1200

        Item: Coffee Table
        Description: Modern glass and metal coffee table
        Estimated Price: $200-300

        Please list all visible items following this exact format without any additional characters or formatting.
      `

      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      if (!text) {
        throw new Error("No analysis generated")
      }

      // Try to parse the response into structured data
      const parsedItems = parseAnalysisText(text)

      if (parsedItems) {
        return Response.json({ items: parsedItems })
      } else {
        // If parsing fails, return the raw text but cleaned
        return Response.json({
          items: [
            {
              item: "Analysis Result",
              description: cleanText(text),
              estimatedPrice: "N/A",
            },
          ],
        })
      }
    } catch (apiError) {
      console.error("Gemini API Error:", apiError)
      return Response.json({ error: "Failed to analyze image with AI model. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Error analyzing image:", error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to process image. Please try again.",
      },
      { status: 500 },
    )
  }
}

