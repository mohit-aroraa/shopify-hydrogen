import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination, Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import {ChevronRightIcon, ChevronLeftIcon} from '@heroicons/react/24/outline';
import {Link} from '@remix-run/react';
import {Money} from '@shopify/hydrogen';
import {useAside} from './Aside';
import {CartForm} from '@shopify/hydrogen';
import {useOptimisticCart} from '@shopify/hydrogen';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
useEffect
export default (props) => {
  const {products} = props;
    const {open} = useAside();
  const fetcher = useFetcher();

  const atc = (product) => {
    const formData = new FormData();
    const cartFormInput = {
      action: CartForm.ACTIONS.LinesAdd,  // Define the action
      inputs: {
        lines: [{ merchandiseId: product.variants.nodes[0].id, quantity: 1 }]  // Define inputs
      }
    };
    formData.append('cartFormInput', JSON.stringify(cartFormInput));
  
    // Submit the form
    fetcher.submit(formData, {
      method: 'POST',
      action: '/cart',
    })
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.cart) {
        open('cart');
      } 
    }
  }, [fetcher.state, fetcher.data, open]);
  
  

  return (
    <div className="space-y-2">
      <div className="uppercase tracking-wider text-2xl font-semibold mb-8">
        Best Sellers
      </div>
      <Swiper
        className="relative !pb-16"
        slidesPerView={4}
        spaceBetween={10}
        speed={1000}
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
        modules={[Pagination, Navigation]}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="border border-gray-200 rounded-lg inline-block">
              <img
                className="rounded-lg aspect-square"
                src={product.featuredImage?.url}
                alt=""
              />
              <div className="p-4 space-y-2">
                <div>
                  <Money data={product.priceRange.minVariantPrice} />
                </div>
                <Link
                  to={`/products/${product.handle}`}
                  className="text-emerald-950 font-light text-xl"
                >
                  {product.title}
                </Link>
                <CartForm
                  route="/cart"
                  action={CartForm.ACTIONS.LinesAdd}
                  inputs={{
                    lines: [{merchandiseId: product.variants.nodes[0].id}],
                    quantity: 1,
                  }}
                >
                  <button
                    onClick={() => {
                      atc(product);
                    }}
                    type="submit"
                    className="w-full cursor-pointer text-lg text-emerald-950 border border-emerald-950 rounded-full px-4 py-2 mt-2 hover:bg-emerald-950 hover:text-white"
                  >
                    Buy Now
                  </button>
                </CartForm>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="absolute z-10 w-full bottom-0 text-center">
          <div className="inline-flex mx-auto items-center">
            <div className="swiper-prev cursor-pointer">
              <ChevronLeftIcon className="w-4 h-4" />
            </div>
            <div className="page"></div>
            <div className="swiper-next cursor-pointer">
              <ChevronRightIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Swiper>
    </div>
  );
};
