import React from 'react';
import { View, Image } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { Button } from '@/components';
import styles from './index.module.less';

export const ControlBar = () => {
  const workMode = useProps(props => props.work_mode);
  const actions = useActions();

  const handleTogglePower = React.useCallback(() => {
    actions.switch_led.toggle({ throttle: 300 });
  }, []);
  let mode = 'colour'
  const handleToggleMode = React.useCallback(() => {
    // 切换tab,对应下发工作模式
    console.log(workMode, mode)
    mode = mode === 'colour' ? 'music' : 'colour'
    actions.work_mode.set(mode, { checkRepeat: false, throttle: 300 });
  }, []);

  return (
    <View className={styles.container}>
      <Image hidden={workMode === 'music'} className={styles.bg} onClick={handleToggleMode} mode="widthFix" src="/images/mode_colour.png" />
      <Image hidden={workMode === 'colour'} className={styles.bg} onClick={handleToggleMode} mode="widthFix" src="/images/mode_music.png" />
      {/* <Button
        img="/images/power.png"
        onClick={handleTogglePower}
        imgClassName={styles.powerBtn}
        className={styles.powerBox}
      /> */}
    </View>
  );
};

ControlBar.height = 103;
