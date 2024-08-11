import React, { useState, useEffect } from 'react';
import { Swiper, SwiperItem, View } from '@ray-js/ray';

export const RotatingWheel = () => {
  const [current, setCurrent] = useState(0);
  const numbers = Array.from({ length: 180 }, (_, i) => i + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % 180);
    }, 100); // 每100毫秒切换一次
    return () => clearInterval(interval);
  }, []);

  return (
    <Swiper
      autoplay
      circular
      current={current}
      interval={100}
      vertical
      onChange={(e) => setCurrent(e.detail.current)}
    >
      {numbers.map(num => (
        <SwiperItem key={num}>
          <View>{num}</View>
        </SwiperItem>
      ))}
    </Swiper>
  );
};
