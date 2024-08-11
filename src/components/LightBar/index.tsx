import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useUnmount } from 'ahooks';
import { View, Text, Image, Button, Swiper } from '@ray-js/ray';
import _ from 'lodash-es';
import { useThrottleFn } from 'ahooks';
import { useProps, utils, kit, useStructuredActions, useStructuredProps, useSupport } from '@ray-js/panel-sdk';
import { LampMusicCard, LampColorSlider, LampBrightSlider } from '@ray-js/components-ty-lamp';
import defaultConfig from '@/config/default';

import Strings from '@/i18n';
import styles from './index.module.less';

interface IProps {
  style?: React.CSSProperties;
  /**
   * 彩光值，不传则默认使用 DP colour_data
   */
  colour?: COLOUR;
  onRelease: (code: string, value: COLOUR) => void;
  onChange?: (isColor: boolean, value: COLOUR) => void;
  setScrollEnabled?: (v: boolean) => void;
}

export const LightBar = (props: IProps) => {
  const { defaultAppMusicList } = defaultConfig;
  const { onMusic2RgbChange, offMusic2RgbChange } = kit.music2rgb;
  const musicKey = ['music', 'romance', 'game'] as const;
  const [activeId, setActiveId] = useState(-1);
  const power = useProps(dpState => dpState.switch_led);
  const work_mode = useProps(dpState => dpState.work_mode);
  const sensitivity = useProps(dpState => dpState.sensitivity);
  const music_color = useProps(dpState => dpState.music_color);
  const music_mode = useProps(dpState => dpState.music_mode);
  const actions = useStructuredActions();

  const { style, onRelease, onChange, setScrollEnabled } = props;

  const support = useSupport();
  const colourDp = useStructuredProps(dpState => dpState.colour_data);
  const colour = _.isUndefined(props.colour) ? colourDp : props.colour;
  const dpStructuredActions = useStructuredActions();
  const isTouching = React.useRef(false);
  const handleColourMove = useThrottleFn(
    (v: number, type: keyof COLOUR) => {
      if (isTouching.current) setScrollEnabled?.(false);
      const newColorData = { ...colour, [type]: v };
      console.log('handleColourMove:', newColorData)
      onChange?.(true, newColorData);
    },
    { wait: 80 }
  ).run;

  const handleColourEnd = React.useCallback(
    (v: number, type: keyof COLOUR) => {
      setScrollEnabled?.(true);
      const newColorData = { ...colour, [type]: v };
      console.log('handleColourEnd:', newColorData)
      onRelease?.(colour_data.code, newColorData);
    },
    [colour]
  );

  const handleTouchStart = React.useCallback(
    (type: 'hue' | 'saturation' | 'value') => {
      return (v: number) => {
        isTouching.current = true;
        handleColourMove(v, type);
      };
    },
    [colour]
  );

  const handleTouchEnd = React.useCallback(
    (type: 'hue' | 'saturation' | 'value') => {
      return (v: number) => {
        isTouching.current = false;
        console.log(v)
        handleColourEnd(v, type);
      };
    },
    [colour]
  );

  const handleMusic2RgbChange = useCallback((id: number) => {
    const mode = _.find<MusicConfig>(defaultAppMusicList, d => d.id === id)?.mode ?? 0;
    onMusic2RgbChange(data => {
      const musicData = {
        mode,
        hue: data.hue,
        saturation: data.saturation,
        value: data.value,
        brightness: 0,
        temperature: 0,
      };
      // actions.music_data.set(musicData);
    });
  }, []);

  useEffect(() => {
    if (!power || work_mode !== 'music' || activeId === -1) {
      setActiveId(-1);
      offMusic2RgbChange();
      return;
    }
    handleMusic2RgbChange(activeId);
  }, [power, activeId, work_mode]);

  useUnmount(() => {
    offMusic2RgbChange();
  });

  const appMusicList = useMemo(
    () =>
      musicKey.map((item, index) => {
        return {
          id: index,
          icon: `/images/music_${item}.png`,
          title: Strings.getLang(`music_${item}`),
          colorArr: defaultAppMusicList?.[index]?.colorArea?.map(v =>
            utils.hsv2rgbString(v.hue, v.saturation, v.value)
          ),
        };
      }),
    []
  );

  const handlePlay = React.useCallback(
    (item: typeof appMusicList[number]) => () => {
      // 此处可以根据状态进行 dp 的下发
      setActiveId(activeId === item.id ? -1 : item.id);
    },
    [activeId]
  );
  let srcc = '/images/image_'
  let autoimg = '/images/auto.png'
  let handimg = '/images/hand.png'
  let mode = 'bar'
  let [barAuto, setBarAuto] = React.useState(false);
  const handleToggleMode = React.useCallback(() => {
    // 切换bar/screen模式
    console.log(mode)
  }, []);
  const handleToggleBar = React.useCallback(() => {
    // 切换Bar手动/自动模式
    if(barAuto) {
      barAuto = false
      setBarAuto(false)
    } else {
      barAuto = true
      setBarAuto(true)
    }
  }, []);

  const trackStyle = {
    margin: '30rpx 0',
    width: '644rpx',
    height: '20rpx',
  };
  const thumbStyle = {
    width: '48rpx',
    height: '48rpx',
    borderRadius: '100%',
  };
  const [current, setCurrent] = React.useState(0);

  const handleClick = () => {
    setCurrent(current + 1); // 更新状态，触发重新渲染
  };
  // DP：music_mode
  // const musicMode = useProps(props => props.music_mode);
  // const actions = useActions();

  const handleToggleMusic = React.useCallback((e, index) => {
    console.log(e, index)
    actions.music_mode.set(index);
  }, []);
  const handleSetS = React.useCallback((index) => {
    console.log(index)
    actions.sensitivity.set(index);
  }, []);
  // 不适用music_color改用彩光colour_data
  const handleSetColor = React.useCallback((index) => {
    let h = parseInt(index).toString(16).padStart(4, '0');
    let sv = '03E803E8'
    let hsv = (h + sv)
    let controlData = { hue: index, saturation: 1000, value: 1000, bright: 0, temp: 0 };
    console.log('controlData:',controlData)
    dpStructuredActions.colour_data.set(controlData, { throttle: 300 });
    // actions.colour.set(h + sv);
  }, []);
  return (
    <View className={styles.list}>
      {/* <Button className={styles.bright}>{Strings.getLang('bar')}</Button>
      <Button className={styles.dark}>{Strings.getLang('screen')}</Button> */}
      <View className={styles.swiperBox}>
        <Swiper
          vertical={true}
          circular={true}
          interval={2500}
          current={current}
          autoplay={barAuto}
          dotActiveColor={'#EF4DFF'}
          dataSource={['1.png', '2.png', '3.png','4.png', '5.png', '6.png','7.png', '8.png', '9.png','10.png', '11.png', '12.png','13.png', '14.png', '15.png','16.png', '17.png', '18.png']}
          renderItem={(img: string, index) => {
            if (index === current) {
              return (
                <View className={styles.swiperBig}>
                  <Text className={styles.num}>{index+1}</Text>
                  {/* <Image
                    src="/images/bar_2.svg"
                    mode="widthFix"
                    className={styles.svg}
                  /> */}
                  <Image className={styles.filter} src={srcc+img} style={{marginBottom: 40, width: 600}} mode="widthFix" />
                </View>
              );
            }
            return (
              <View className={styles.swiperView}>
                <Text className={styles.num}>{index+1}</Text>
                <Image src={srcc+img} style={{marginBottom: 40, width: 600}} mode="widthFix" />
              </View>
            );
          }}
          onChange={(event) => {
            const { current } = event;
            // music_mode 旋转则发零
            actions.music_mode.set(1 + event.detail.current);
            console.log(event.detail.current)
            setCurrent(event.detail.current, event)
          }}
        >
        </Swiper>
      </View>
      <View className={styles.autobox}>
        <Image hidden={!barAuto} onClick={handleToggleBar} src={autoimg} style={{marginTop: 30, marginBottom: 40, width: 220, marginLeft: 220}} mode="widthFix" />
        <Image hidden={barAuto} onClick={handleToggleBar} src={handimg} style={{marginTop: 30, marginBottom: 40, width: 220, marginLeft: 220}} mode="widthFix" />
      </View>
      <View className={styles.sliderbox}>
        <Text className={styles.text}>颜色</Text>
        <LampColorSlider
          trackStyle={trackStyle}
          thumbStyle={thumbStyle}
          value={colour?.hue ?? 1}
          onTouchStart={handleTouchStart('value')}
          onTouchMove={v => {
            // handleColourMove(v, 'value');
            handleSetColor(v)
          }}
          onTouchEnd={handleTouchEnd('value')}
        />
      </View>
      <View className={styles.sliderbox}>
        <Text className={styles.text}>灵敏度</Text>
        <LampBrightSlider
          trackStyle={trackStyle}
          thumbStyle={thumbStyle}
          value={sensitivity * 10 || 1}
          onTouchStart={handleTouchStart('value')}
          onTouchMove={v => {
            // handleColourMove(v, 'value');
            console.log(v,v/10);
            handleSetS(v/10)}}
          onTouchEnd={handleTouchEnd('value')}
        />
      </View>
    </View>
  );
};
