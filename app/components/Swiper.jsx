import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination, Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

export default (props) => {
  const {slides} = props;
  return (
    <Swiper
      effect="fade"
      speed={1000}
      pagination={{
        clickable: true,
        el: '.page',
        bulletActiveClass: 'page-active',
      }}
      loop={true}
      navigation={{
        nextEl: '.swiper-next',
        prevEl: '.swiper-prev',
        
      }}
      modules={[Pagination, Navigation]} // Enable loop mode
      className="w-full h-196 rounded-lg mt-4"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id} className="w-full">
          <div className="w-full h-196 flex items-center justify-center relative">
            <img
              src={slide.media.reference.image.url}
              alt={slide.title}
              className="w-full h-196 object-cover absolute inset-0"
            />
            <div className="absolute w-auto inset-0 p-8 flex items-center">
              <div>
                <h4>{slide.tagline}</h4>
                <h1 className={`text-emerald-950 !mb-10 !text-5xl`}>
                  {slide.title}
                </h1>
                <a
                  href={slide.cta_link}
                  className={`px-8 py-4 !text-white rounded-full bg-emerald-950`}
                >
                  {slide.cta_text}
                </a>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
      <div className="absolute z-10 w-full bottom-0 text-center">
        <div className='inline-flex mx-auto items-center'>
        <div className="swiper-prev cursor-pointer">
            <ChevronLeftIcon className="w-4 h-4" />
        </div>
        <div className='page'></div>
        <div className="swiper-next cursor-pointer">
            <ChevronRightIcon className="w-4 h-4" />
        </div>
        </div>
      </div>
    </Swiper>
  );
};
