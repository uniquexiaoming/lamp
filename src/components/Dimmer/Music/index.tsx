import _, { initial } from 'lodash-es';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useUnmount } from 'ahooks';
import { View, Text, Image, Button, Swiper  } from '@ray-js/ray';
import { useProps, utils, kit, useStructuredActions } from '@ray-js/panel-sdk';
// import {
//   LampColorSlider,
//   LampSaturationSlider,
//   LampBrightSlider,
// } from '@ray-js/components-ty-lamp';
import { TabBar, LightBar, LightScreen } from '@/components';
import defaultConfig from '@/config/default';
// import { useSystemInfo } from '@/hooks/useSystemInfo';
import Strings from '@/i18n';
import styles from './index.module.less';

const { defaultAppMusicList } = defaultConfig;
const { onMusic2RgbChange, offMusic2RgbChange } = kit.music2rgb;

const musicKey = ['music', 'romance', 'game'] as const;

interface Props {
  style?: React.CSSProperties;
}

export const Music: React.FC<Props> = ({ style }) => {
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
  // let lightMode = 'bar'
  let [barMode, setBarMode] = React.useState(true);
  const handleToggleMode = React.useCallback(() => {
    // 切换bar/screen模式
    if(barMode) {
      barMode = false
      setBarMode(false)
    } else {
      barMode = true
      setBarMode(true)
    }
  }, []);

  const [current, setCurrent] = React.useState(0);

  const handleClick = () => {
    setCurrent(current + 1); // 更新状态，触发重新渲染
  };
  const renderMode = () => {
    if (barMode) {
      return <LightBar />
    } else {
      return <LightScreen />
    }
  }

  return (
    <View style={style} className={styles.list}>
      {/* bar or screen */}
      <View className={styles.mode}>
        <Button style={{display:barMode?'':'none'}} onClick={handleToggleMode} className={styles.bright}>{Strings.getLang('bar')}</Button>
        <Button style={{display:barMode?'':'none'}} onClick={handleToggleMode} className={styles.dark}>{Strings.getLang('screen')}</Button>
        <Button style={{display:barMode?'none':''}} onClick={handleToggleMode} className={styles.dark}>{Strings.getLang('bar')}</Button>
        <Button style={{display:barMode?'none':''}} onClick={handleToggleMode} className={styles.bright}>{Strings.getLang('screen')}</Button>
      </View>
      {renderMode()}
      {/* <LightBar /> */}
      {/* <TabBar
          itemWidth={'200'}
          itemHeight={56}
          value={Strings.getLang('bar')}
          tabList={[Strings.getLang('bar'), Strings.getLang('screen')]}
          onClick={v => console.log(v)}
        /> */}
      {/* <Image hidden={mode === 'bar'} className={styles.bg} onClick={handleToggleMode} mode="widthFix" src="" /> */}
      {/* <Image hidden={mode === 'screen'} className={styles.bg} onClick={handleToggleMode} mode="widthFix" src="/images/mode_music.png" /> */}
      {/* <CoolBarCard /> */}
      
      {/* <View className={styles.content}>
        {appMusicList.map(item => {
          return (
            <LampMusicCard
              key={item.id}
              active={item.id === activeId}
              data={item}
              onPlay={handlePlay(item)}
            />
          );
        })}
      </View> */}
    </View>
  );
};
