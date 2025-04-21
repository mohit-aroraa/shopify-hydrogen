import { Link } from '@remix-run/react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination, Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

export default (props) => {
    const {categories} = props;
    return (
        <div className='w-full pb-8 relative'>
            <div className="uppercase tracking-wider text-2xl font-semibold mb-8 text-center">Shop By Category</div>
            <Swiper 
            className="relative !pb-16"
            speed={1000}
            slidesPerView={6}
            spaceBetween={10}
            modules={[Pagination, Navigation]} //
            pagination={{
                clickable: true,
                el: '.page',
                bulletActiveClass: 'page-active',
              }}
              loop={false}
              navigation={{
                nextEl: '.swiper-next',
                prevEl: '.swiper-prev',
                
              }}
            >
                {categories.map((category) => (
                    <SwiperSlide key={category.id} className="w-full">
                        <div className='text-center'>
                            <img className='w-40 mx-auto object-contain aspect-square' src={`${category.image?.url}`} alt={category.image?.altText} />
                       
                        <Link to={`/collections/${category.handle}`} className='text-emerald-950 font-light text-sm'>
                        {category.title}
                        </Link>
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
        </div>
    )
}