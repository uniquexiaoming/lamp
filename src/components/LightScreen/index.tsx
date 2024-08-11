import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useUnmount } from 'ahooks';
import { View, Text, Image, Button, Swiper } from '@ray-js/ray';
import { useProps, utils, kit, useStructuredActions } from '@ray-js/panel-sdk';
import { LampMusicCard, LampColorSlider, LampBrightSlider } from '@ray-js/components-ty-lamp';
import defaultConfig from '@/config/default';

import Strings from '@/i18n';
import styles from './index.module.less';

export const LightScreen = () => {
  const { defaultAppMusicList } = defaultConfig;
  const { onMusic2RgbChange, offMusic2RgbChange } = kit.music2rgb;
  const musicKey = ['music', 'romance', 'game'] as const;
  const [activeId, setActiveId] = useState(-1);
  const power = useProps(dpState => dpState.switch_led);
  const work_mode = useProps(dpState => dpState.work_mode);
  const actions = useStructuredActions();

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
      actions.music_data.set(musicData);
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
  let srcc = '/images/screen_'
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
  return (
    <View className={styles.screen}>
      <View className={styles.swiperBox}>
        <Swiper
          circular={true}
          interval={1000}
          current={current}
          autoplay={barAuto}
          dataSource={['1.png', '1.png', '1.png', '1.png','1.png', '1.png']}
          renderItem={(img: string, index) => {
            if (index === current) {
              return (
                <View className={styles.swiperBig}>
                  <Image className={styles.filter} src={srcc+img} style={{width: 320}} mode="widthFix" />
                </View>
              );
            }
            return (
              <View className={styles.swiperView}>
                <Image src={srcc+img} style={{width: 320}} mode="widthFix" />
              </View>
            );
          }}
          onChange={(event) => {
            const { current } = event;
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
          value={1}
        />
      </View>
      <View className={styles.sliderbox}>
        <Text className={styles.text}>灵敏度</Text>
        <LampBrightSlider
          trackStyle={trackStyle}
          thumbStyle={thumbStyle}
          value={1}
        />
      </View>
    </View>
  );
};
