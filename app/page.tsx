"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useSpring, useInView } from "framer-motion"
import { Upload, Sparkles, Camera, PlusCircle, Download, Home, ChevronUp } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface AnalyzedItem {
  item: string
  description: string
  estimatedPrice: string
}

const MotionCard = motion(Card)
const MotionButton = motion(Button)

export default function ImageAnalysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [items, setItems] = useState<AnalyzedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const contentRef = useRef<HTMLDivElement>(null)

  const calculateTotal = (items: AnalyzedItem[]) => {
    return items.reduce((total, item) => {
      const priceStr = item.estimatedPrice
      if (priceStr === "N/A") return total

      const numbers = priceStr.match(/\d+/g)
      if (!numbers) return total

      const value = numbers.length > 1 ? (Number(numbers[0]) + Number(numbers[1])) / 2 : Number(numbers[0])

      return total + value
    }, 0)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.")
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("File size too large. Maximum size is 4MB.")
      return
    }

    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setLoading(true)
    setError("")
    setItems([])

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image")
      }

      if (data.items) {
        setItems(data.items)
      }
    } catch (error) {
      console.error("Error analyzing image:", error)
      setError(error instanceof Error ? error.message : "Failed to analyze image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!contentRef.current) return

    try {
      setLoading(true)

      // Create canvas from the content
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        width: contentRef.current.offsetWidth,
        height: contentRef.current.offsetHeight,
        windowWidth: contentRef.current.offsetWidth,
        windowHeight: contentRef.current.offsetHeight,
      })

      // Calculate dimensions to fit A4 page
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const aspectRatio = canvas.height / canvas.width
      const imgWidth = pdfWidth
      const imgHeight = pdfWidth * aspectRatio

      // Add multiple pages if content is too long
      let heightLeft = imgHeight
      let position = 0
      let page = 1

      while (heightLeft >= 0) {
        if (page > 1) {
          pdf.addPage()
        }

        const heightOnCurrentPage = Math.min(pdfHeight, heightLeft)
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST")

        heightLeft -= pdfHeight
        position -= pdfHeight
        page++
      }

      pdf.save("inventory-analysis.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError("Failed to generate PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true })

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-accent z-50" style={{ scaleX, transformOrigin: "0%" }} />

      {/* Navigation with animated underline on hover */}
      <motion.nav
        className="bg-primary text-primary-foreground"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Home className="w-6 h-6" />
            <span className="font-montserrat font-bold text-xl">Home Inventory</span>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section with particle effect */}
      <div className="w-full bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
              "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <div className="container mx-auto px-4 py-12 text-white relative">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            <motion.span
              animate={{
                textShadow: [
                  "0 0 0px rgba(255,255,255,0.5)",
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 0px rgba(255,255,255,0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Get Instant Valuation for Your Home Inventory
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-white/90 text-lg max-w-2xl mx-auto"
          >
            Upload photos of your rooms or furniture for instant AI-powered analysis and valuation
          </motion.p>
        </div>
      </div>

      {/* Feature Cards with stagger animation */}
      <div className="container mx-auto px-4 py-8" ref={containerRef}>
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {[
            {
              icon: <Sparkles className="w-6 h-6 text-secondary" />,
              title: "AI-Powered Recognition",
              description: "Instantly identify items in your photos",
            },
            {
              icon: <PlusCircle className="w-6 h-6 text-secondary" />,
              title: "Total Value Calculation",
              description: "Get accurate estimates for your items",
            },
            {
              icon: <Download className="w-6 h-6 text-secondary" />,
              title: "Easy Export",
              description: "Download reports for insurance claims",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <MotionCard className="border-2 border-secondary/20">
                <CardHeader>
                  <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </MotionCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content with fade-in animation */}
        <motion.div
          className="grid lg:grid-cols-2 gap-6"
          ref={contentRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Image Upload Section */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <MotionCard
              className="border-2 border-secondary/20"
              whileHover={{ boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Camera className="w-5 h-5 text-secondary" />
                  </motion.div>
                  Upload Image
                </CardTitle>
                <CardDescription>Upload a photo of your room or furniture for instant analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-secondary/20 rounded-lg p-6 bg-muted/50 hover:bg-muted/80 transition-colors min-h-[300px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                      aria-label="Upload image"
                    />
                    {selectedImage ? (
                      <motion.div
                        className="relative w-full h-full min-h-[300px]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={selectedImage || "/placeholder.svg"}
                          alt="Selected image"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="text-center"
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-secondary" />
                        <p className="text-lg text-muted-foreground mb-2">Drop your image here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-center gap-2 py-4"
                    >
                      <motion.div
                        animate={{
                          rotate: 360,
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                          scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                        }}
                      >
                        <Sparkles className="w-5 h-5 text-secondary" />
                      </motion.div>
                      <p className="text-sm text-muted-foreground">
                        {loading ? "Processing..." : "Analyzing image..."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-center text-destructive text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </CardContent>
            </MotionCard>
          </motion.div>

          {/* Analysis Results Section */}
          <AnimatePresence>
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <MotionCard
                  className="border-2 border-secondary/20"
                  whileHover={{ boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Analysis Results</CardTitle>
                    <MotionButton
                      variant="outline"
                      size="sm"
                      onClick={downloadPDF}
                      disabled={loading}
                      className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 border-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {loading ? "Generating PDF..." : "Download Report"}
                    </MotionButton>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="rounded-lg border bg-card overflow-x-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-montserrat">Item</TableHead>
                            <TableHead className="font-montserrat">Description</TableHead>
                            <TableHead className="text-right font-montserrat">Est. Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b transition-colors hover:bg-muted/50"
                              whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                            >
                              <TableCell className="font-medium">{item.item}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell className="text-right font-ibm-plex-mono">
                                <motion.span
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 + 0.2 }}
                                >
                                  {item.estimatedPrice}
                                </motion.span>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <motion.span
                      className="text-sm text-muted-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      Total Items: {items.length}
                    </motion.span>
                    <motion.div className="text-right" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <p className="text-sm text-muted-foreground">Estimated Total:</p>
                      <motion.p
                        className="text-xl font-semibold text-accent font-ibm-plex-mono"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        ${calculateTotal(items).toLocaleString()}
                      </motion.p>
                    </motion.div>
                  </CardFooter>
                </MotionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 space-y-4"
      >
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="bg-secondary text-white rounded-full p-3 shadow-lg block mb-4"
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.label
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-accent text-white rounded-full p-3 shadow-lg cursor-pointer block"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="Upload image"
          />
          <PlusCircle className="w-6 h-6" />
        </motion.label>
      </motion.div>
    </div>
  )
}

