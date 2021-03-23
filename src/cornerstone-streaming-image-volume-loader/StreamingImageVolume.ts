import ImageVolume from '../cache/classes/ImageVolume'
import { IImageVolume, IStreamingVolume } from '../types'
import prefetchImageIds from './prefetchImageIds'

// James wants another layer in between ImageVolume and SliceStreamingImageVolume
// which adds loaded/loading as an interface?

export default class StreamingImageVolume extends ImageVolume {
  readonly imageIds: Array<string>
  loadStatus: {
    loaded: boolean
    loading: boolean
    cachedFrames: Array<boolean>
    callbacks: Array<Function>
  }

  constructor(
    imageVolumeProperties: IImageVolume,
    streamingProperties: IStreamingVolume
  ) {
    super(imageVolumeProperties)

    this.imageIds = streamingProperties.imageIds
    this.loadStatus = streamingProperties.loadStatus
  }

  private _hasLoaded = (): boolean => {
    const { loadStatus, imageIds } = this
    const numFrames = imageIds.length

    for (let i = 0; i < numFrames; i++) {
      if (!loadStatus.cachedFrames[i]) {
        return false
      }
    }

    return true
  }

  public cancelLoading() {
    const { loadStatus } = this

    if (!loadStatus || !loadStatus.loading) {
      return
    }

    // Set to not loading.
    loadStatus.loading = false

    // Remove all the callback listeners
    this.clearLoadCallbacks()
  }

  public clearLoadCallbacks() {
    this.loadStatus.callbacks = []
  }

  public load = (callback: Function) => {
    const { imageIds, loadStatus } = this

    if (loadStatus.loading === true) {
      console.log(`loadVolume: Loading is already in progress for ${this.uid}`)
      return // Already loading, will get callbacks from main load.
    }

    const { loaded } = this.loadStatus
    const numFrames = imageIds.length

    if (loaded) {
      if (callback) {
        callback({
          success: true,
          framesLoaded: numFrames,
          numFrames,
          framesProcessed: numFrames,
        })
      }
      return
    }

    if (callback) {
      this.loadStatus.callbacks.push(callback)
    }

    const streamingVolume = this

    // Todo: move to class method? this is circular now...
    prefetchImageIds(streamingVolume)
  }

  decache(completelyRemove = false) {
    if (completelyRemove) {
    } else {
      // Do we have enough space in volatile cache?
      // If not, remove some
      // Next, start convertToImages (createImage style) => putIntoImageCache
    }
  }
}
