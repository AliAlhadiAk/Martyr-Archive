import fs from 'fs'
import path from 'path'
import { uploadFile, STORAGE_BUCKETS } from './supabase-storage'

const MARTYRS_DATA_FILE = path.join(process.cwd(), 'data', 'martyrs.json')

// Types for martyr data structure
export interface MartyrPersonalInfo {
  name: string
  arabicName: string
  englishName: string
  age: number
  dateOfBirth: string
  placeOfBirth: string
  nationality: string
  martyrdomDate: string
  martyrdomPlace: string
  martyrdomCircumstances: string
}

export interface MartyrFamilyInfo {
  fatherName: string
  motherName: string
  siblings: string[]
  spouse: string | null
  children: string[]
}

export interface MartyrBiography {
  education: string
  occupation: string
  achievements: string[]
  interests: string[]
  testament: string
}

export interface MediaAsset {
  id: string
  path: string
  url: string
  altText?: string
  uploadedAt: string
  fileSize: string
  dimensions?: { width: number; height: number }
  caption?: string
  title?: string
  duration?: string
  description?: string
  type?: string
}

export interface MartyrMediaAssets {
  profileImage: MediaAsset | null
  gallery: MediaAsset[]
  videos: MediaAsset[]
  audio: MediaAsset[]
  documents: MediaAsset[]
}

export interface MartyrMetadata {
  createdAt: string
  updatedAt: string
  createdBy: string
  status: 'active' | 'inactive' | 'pending'
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface MartyrStatistics {
  views: number
  downloads: number
  shares: number
  memorialCandles: number
}

export interface Martyr {
  id: string
  personalInfo: MartyrPersonalInfo
  familyInfo: MartyrFamilyInfo
  biography: MartyrBiography
  mediaAssets: MartyrMediaAssets
  metadata: MartyrMetadata
  statistics: MartyrStatistics
}

export interface MartyrsData {
  martyrs: Martyr[]
  metadata: {
    totalCount: number
    lastUpdated: string
    version: string
    schema: any
  }
}

// Service class for managing martyrs
export class MartyrService {
  private data: MartyrsData

  constructor() {
    this.ensureDataFile()
    this.data = this.loadData()
  }

  private ensureDataFile() {
    const dataDir = path.dirname(MARTYRS_DATA_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    if (!fs.existsSync(MARTYRS_DATA_FILE)) {
      const initialData: MartyrsData = {
        martyrs: [],
        metadata: {
          totalCount: 0,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          schema: {
            martyrId: 'unique identifier for each martyr',
            filePaths: 'organized storage paths for different media types',
            storageStructure: {
              martyrs: 'root folder for all martyr data',
              martyr_id: 'individual martyr folder',
              profile: 'profile images',
              gallery: 'additional photos',
              audio: 'audio recordings',
              documents: 'PDFs and other documents'
            }
          }
        }
      }
      fs.writeFileSync(MARTYRS_DATA_FILE, JSON.stringify(initialData, null, 2))
    }
  }

  private loadData(): MartyrsData {
    try {
      const fileContents = fs.readFileSync(MARTYRS_DATA_FILE, 'utf8')
      return JSON.parse(fileContents)
    } catch (error) {
      console.error('Error loading martyrs data:', error)
      return {
        martyrs: [],
        metadata: {
          totalCount: 0,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          schema: {}
        }
      }
    }
  }

  private saveData() {
    try {
      this.data.metadata.lastUpdated = new Date().toISOString()
      this.data.metadata.totalCount = this.data.martyrs.length
      fs.writeFileSync(MARTYRS_DATA_FILE, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('Error saving martyrs data:', error)
      throw new Error('Failed to save martyr data')
    }
  }

  // Generate unique martyr ID
  private generateMartyrId(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `martyr_${timestamp}_${random}`
  }

  // Generate organized file paths
  private generateFilePath(martyrId: string, fileType: 'profile' | 'gallery' | 'audio' | 'documents', fileName: string): string {
    return `martyrs/${martyrId}/${fileType}/${fileName}`
  }

  // Upload profile image
  async uploadProfileImage(martyrId: string, file: File, altText?: string): Promise<MediaAsset> {
    const fileName = `profile-${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const filePath = this.generateFilePath(martyrId, 'profile', fileName)
    
    const result = await uploadFile(file, {
      name: fileName,
      size: file.size,
      type: file.type,
      bucket: STORAGE_BUCKETS.IMAGES
    })

    return {
      id: `profile_${martyrId}_${Date.now()}`,
      path: filePath,
      url: result.url,
      altText: altText || `صورة الشهيد ${martyrId}`,
      uploadedAt: new Date().toISOString(),
      fileSize: result.size,
      dimensions: { width: 800, height: 600 } // Default dimensions
    }
  }

  // Upload gallery images
  async uploadGalleryImages(martyrId: string, files: File[], captions?: string[]): Promise<MediaAsset[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `gallery-${Date.now()}-${index}-${file.name.replace(/\s+/g, '-')}`
      const filePath = this.generateFilePath(martyrId, 'gallery', fileName)
      
      const result = await uploadFile(file, {
        name: fileName,
        size: file.size,
        type: file.type,
        bucket: STORAGE_BUCKETS.IMAGES
      })

      return {
        id: `gallery_${martyrId}_${Date.now()}_${index}`,
        path: filePath,
        url: result.url,
        altText: `صورة إضافية للشهيد ${martyrId}`,
        uploadedAt: new Date().toISOString(),
        fileSize: result.size,
        dimensions: { width: 800, height: 600 },
        caption: captions?.[index] || `صورة ${index + 1}`
      }
    })

    return Promise.all(uploadPromises)
  }

  // Upload audio files
  async uploadAudioFiles(martyrId: string, files: File[], titles?: string[], descriptions?: string[]): Promise<MediaAsset[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `audio-${Date.now()}-${index}-${file.name.replace(/\s+/g, '-')}`
      const filePath = this.generateFilePath(martyrId, 'audio', fileName)
      
      const result = await uploadFile(file, {
        name: fileName,
        size: file.size,
        type: file.type,
        bucket: STORAGE_BUCKETS.AUDIO
      })

      // Calculate duration (approximate)
      const duration = this.calculateAudioDuration(file.size, file.type)

      return {
        id: `audio_${martyrId}_${Date.now()}_${index}`,
        path: filePath,
        url: result.url,
        title: titles?.[index] || `تسجيل صوتي ${index + 1}`,
        uploadedAt: new Date().toISOString(),
        fileSize: result.size,
        duration,
        description: descriptions?.[index] || `ملف صوتي للشهيد ${martyrId}`
      }
    })

    return Promise.all(uploadPromises)
  }

  // Upload video files
  async uploadVideoFiles(martyrId: string, files: File[], titles?: string[], descriptions?: string[]): Promise<MediaAsset[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `video-${Date.now()}-${index}-${file.name.replace(/\s+/g, '-')}`
      const filePath = this.generateFilePath(martyrId, 'gallery', fileName)

      const result = await uploadFile(file, {
        name: fileName,
        size: file.size,
        type: file.type,
        bucket: STORAGE_BUCKETS.VIDEOS,
      })

      return {
        id: `video_${martyrId}_${Date.now()}_${index}`,
        path: filePath,
        url: result.url,
        title: titles?.[index] || `فيديو ${index + 1}`,
        uploadedAt: new Date().toISOString(),
        fileSize: result.size,
        type: file.type.split('/')[1]?.toUpperCase() || 'VIDEO',
        description: descriptions?.[index] || `فيديو للشهيد ${martyrId}`,
      }
    })

    return Promise.all(uploadPromises)
  }

  // Upload document files
  async uploadDocumentFiles(martyrId: string, files: File[], titles?: string[], descriptions?: string[]): Promise<MediaAsset[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `doc-${Date.now()}-${index}-${file.name.replace(/\s+/g, '-')}`
      const filePath = this.generateFilePath(martyrId, 'documents', fileName)
      
      const result = await uploadFile(file, {
        name: fileName,
        size: file.size,
        type: file.type,
        bucket: STORAGE_BUCKETS.DOCUMENTS
      })

      return {
        id: `doc_${martyrId}_${Date.now()}_${index}`,
        path: filePath,
        url: result.url,
        title: titles?.[index] || `مستند ${index + 1}`,
        uploadedAt: new Date().toISOString(),
        fileSize: result.size,
        type: file.type.split('/')[1]?.toUpperCase() || 'DOCUMENT',
        description: descriptions?.[index] || `مستند للشهيد ${martyrId}`
      }
    })

    return Promise.all(uploadPromises)
  }

  // Calculate audio duration (approximate)
  private calculateAudioDuration(fileSize: number, format: string): string {
    const bytesPerMinute = format === 'audio/wav' ? 10 * 1024 * 1024 : 1024 * 1024
    const minutes = Math.round(fileSize / bytesPerMinute)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`
    }
    return `${remainingMinutes}:00`
  }

  // Create new martyr
  async createMartyr(
    personalInfo: Omit<MartyrPersonalInfo, 'age'>,
    familyInfo: MartyrFamilyInfo,
    biography: MartyrBiography,
    profileImage?: File,
    galleryFiles?: File[],
    videoFiles?: File[],
    audioFiles?: File[],
    documentFiles?: File[],
    tags: string[] = [],
    createdBy: string = 'admin'
  ): Promise<Martyr> {
    const martyrId = this.generateMartyrId()
    
    // Calculate age from date of birth
    const age = this.calculateAge(personalInfo.dateOfBirth)
    
    // Upload media files
    let profileImageAsset: MediaAsset | null = null
    let galleryAssets: MediaAsset[] = []
    let videoAssets: MediaAsset[] = []
    let audioAssets: MediaAsset[] = []
    let documentAssets: MediaAsset[] = []

    try {
      if (profileImage) {
        profileImageAsset = await this.uploadProfileImage(martyrId, profileImage)
      }

      if (galleryFiles && galleryFiles.length > 0) {
        galleryAssets = await this.uploadGalleryImages(martyrId, galleryFiles)
      }

      if (videoFiles && videoFiles.length > 0) {
        videoAssets = await this.uploadVideoFiles(martyrId, videoFiles)
      }

      if (audioFiles && audioFiles.length > 0) {
        audioAssets = await this.uploadAudioFiles(martyrId, audioFiles)
      }

      if (documentFiles && documentFiles.length > 0) {
        documentAssets = await this.uploadDocumentFiles(martyrId, documentFiles)
      }
    } catch (error) {
      console.error('Error uploading media files:', error)
      // If profile image was provided but failed, abort so details page shows correctly once fixed
      if (profileImage && !profileImageAsset) {
        throw error instanceof Error ? error : new Error('Failed to upload required profile image')
      }
      // Otherwise continue for optional media
    }

    const martyr: Martyr = {
      id: martyrId,
      personalInfo: { ...personalInfo, age },
      familyInfo,
      biography,
      mediaAssets: {
        profileImage: profileImageAsset,
        gallery: galleryAssets,
        videos: videoAssets,
        audio: audioAssets,
        documents: documentAssets
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy,
        status: 'active',
        tags,
        priority: 'medium',
        verificationStatus: 'pending'
      },
      statistics: {
        views: 0,
        downloads: 0,
        shares: 0,
        memorialCandles: 0
      }
    }

    this.data.martyrs.push(martyr)
    this.saveData()

    return martyr
  }

  // Calculate age from date of birth
  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Get all martyrs
  getAllMartyrs(): Martyr[] {
    return this.data.martyrs
  }

  // Get martyr by ID
  getMartyrById(id: string): Martyr | null {
    return this.data.martyrs.find(martyr => martyr.id === id) || null
  }

  // Update martyr
  updateMartyr(id: string, updates: Partial<Martyr>): Martyr | null {
    const index = this.data.martyrs.findIndex(martyr => martyr.id === id)
    if (index === -1) return null

    this.data.martyrs[index] = {
      ...this.data.martyrs[index],
      ...updates,
      metadata: {
        ...this.data.martyrs[index].metadata,
        updatedAt: new Date().toISOString()
      }
    }

    this.saveData()
    return this.data.martyrs[index]
  }

  // Delete martyr
  deleteMartyr(id: string): boolean {
    const index = this.data.martyrs.findIndex(martyr => martyr.id === id)
    if (index === -1) return false

    this.data.martyrs.splice(index, 1)
    this.saveData()
    return true
  }

  // Search martyrs
  searchMartyrs(query: string): Martyr[] {
    const searchTerm = query.toLowerCase()
    return this.data.martyrs.filter(martyr => 
      martyr.personalInfo.name.toLowerCase().includes(searchTerm) ||
      martyr.personalInfo.englishName.toLowerCase().includes(searchTerm) ||
      martyr.biography.occupation.toLowerCase().includes(searchTerm) ||
      martyr.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // Get martyrs by tag
  getMartyrsByTag(tag: string): Martyr[] {
    return this.data.martyrs.filter(martyr => 
      martyr.metadata.tags.includes(tag)
    )
  }

  // Get martyrs by location
  getMartyrsByLocation(location: string): Martyr[] {
    return this.data.martyrs.filter(martyr => 
      martyr.personalInfo.placeOfBirth.toLowerCase().includes(location.toLowerCase()) ||
      martyr.personalInfo.martyrdomPlace.toLowerCase().includes(location.toLowerCase())
    )
  }

  // Get martyrs by year
  getMartyrsByYear(year: number): Martyr[] {
    return this.data.martyrs.filter(martyr => 
      new Date(martyr.personalInfo.martyrdomDate).getFullYear() === year
    )
  }

  // Update martyr statistics
  updateMartyrStatistics(id: string, type: keyof MartyrStatistics, increment: number = 1): boolean {
    const martyr = this.getMartyrById(id)
    if (!martyr) return false

    martyr.statistics[type] += increment
    martyr.metadata.updatedAt = new Date().toISOString()
    
    this.saveData()
    return true
  }

  // Get statistics summary
  getStatisticsSummary() {
    const totalMartyrs = this.data.martyrs.length
    const totalViews = this.data.martyrs.reduce((sum, martyr) => sum + martyr.statistics.views, 0)
    const totalDownloads = this.data.martyrs.reduce((sum, martyr) => sum + martyr.statistics.downloads, 0)
    const totalShares = this.data.martyrs.reduce((sum, martyr) => sum + martyr.statistics.shares, 0)
    const totalCandles = this.data.martyrs.reduce((sum, martyr) => sum + martyr.statistics.memorialCandles, 0)

    return {
      totalMartyrs,
      totalViews,
      totalDownloads,
      totalShares,
      totalCandles,
      averageViews: totalMartyrs > 0 ? Math.round(totalViews / totalMartyrs) : 0,
      averageDownloads: totalMartyrs > 0 ? Math.round(totalDownloads / totalMartyrs) : 0
    }
  }
}

// Export singleton instance
export const martyrService = new MartyrService()