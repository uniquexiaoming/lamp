/**
 * MediaKit
 *
 * @version 3.2.0
 */
declare namespace ty.media {
  export type ManagerContext = {
    /** managerId */
    managerId: number
  }

  /**
   * 拾音控制
   */
  interface GetRGBAudioManagerTask {
    /**
     * 开始识音
     */
    startRGBRecord(params: {
      complete?: () => void
      success?: (params: null) => void
      failure?: (params: {
        errorMsg: string
        errorCode: string | number
        innerError: {
          errorCode: string | number
          errorMsg: string
        }
      }) => void
    }): void

    /**
     * 结束识音
     */
    stopRGBRecord(params: {
      complete?: () => void
      success?: (params: null) => void
      failure?: (params: {
        errorMsg: string
        errorCode: string | number
        innerError: {
          errorCode: string | number
          errorMsg: string
        }
      }) => void
    }): void

    /**
     * 开始监听
     */
    onAudioRgbChange(
      listener: (params: {
        /** managerId */
        managerId: number
        /** 语言转换内容 */
        body: string
      }) => void
    ): void
  }
  export function getRGBAudioManager(params: {
    complete?: () => void
    success?: (params: null) => void
    failure?: (params: {
      errorMsg: string
      errorCode: string | number
      innerError: {
        errorCode: string | number
        errorMsg: string
      }
    }) => void
  }): GetRGBAudioManagerTask
}
