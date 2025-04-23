import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import Swiper from '~/components/Swiper';
import CategoriesSlider from '~/components/CategoriesSlider';
import BestSellers from '~/components/BestSellers';
import FeaturedCollections from '~/components/FeaturedCollections';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  // const deferredData = loadDeferredData(args);
  
  const metaObj = await getMetaObjects(args, 'hero_swiper_content');
  const metaObjects = metaObj.metaobjects.nodes.map(flat)

  const collectionHighlisghts = await getFeaturedCollections(args, 'featured_collection');
  const promotedCollections = collectionHighlisghts.metaobjects.nodes
  

  const featuredCollections =  await loadFeaturedCollections(args);
  const recommendedProducts = await loadRecommendedProducts(args);
  
  // Await the critical data required to render initial state of the page
  // const criticalData = await loadCriticalData(args);

  // console.warn('metaobjects' , metaObjects);

  return {metaObjects, featuredCollections, recommendedProducts, promotedCollections , context: args.context};
}

async function getMetaObjects({context}, type) {
  const metaObjects = context.storefront
  .query(METAOBJECT_QUERY , {
    variables: {
      type
    }
  })
  .catch((error) => {
    // Log query errors, but don't throw them so the page can still render
    console.error(error);
    return null;
  });
  
  return metaObjects
}
async function getFeaturedCollections({context}, type) {
  const featuredCollections = context.storefront
  .query(FEATURED_COLLECTIONS_QUERY , {
    variables: {
      type
    }
  })
  .catch((error) => {
    // Log query errors, but don't throw them so the page can still render
    console.error(error);
    return null;
  });
  
  return featuredCollections
}

async function loadFeaturedCollections({context}) {
  const featuredCollections = await context.storefront
  .query(FEATURED_COLLECTIONS)
  .catch((error) => {

    console.error(error);
    return null;
  });
  
  return featuredCollections.collections.nodes
}


const flat = ({ id, handle, media, ...fields }) => ({
  id,
  handle,
  media,
  ...Object.fromEntries(
    Object.entries(fields).map(([key, obj]) => [key, obj?.value])
  ),
});
/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
async function loadRecommendedProducts({context}) {
  const recommendedProducts = await context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return recommendedProducts.products.nodes
};


export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  console.log('data', data);
  return (
    <div className="home space-y-8">
      <Swiper slides={data.metaObjects} />
      <CategoriesSlider categories={data.featuredCollections} />
      <BestSellers context={data.context} products={data.recommendedProducts} />
      <FeaturedCollections collections={data.promotedCollections} />
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} className='aspect-square' />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url(transform: {maxHeight: 400})
    }
    variants(first:4) {
        nodes {
        id
        title
        }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 20, sortKey: UPDATED_AT, reverse: true, query: "tag:bestseller") {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

const METAOBJECT_QUERY = `#graphql 
query GetMetaObjects ($type: String!) {
metaobjects(first: 10, type: $type) {
    nodes {
      id
      handle
      media: field(key: "media") {
      reference {
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
        ... on Video {
          sources {
            mimeType
            url
          }
        }
      }
      }
      title: field(key: "title") {
      value
      }
      text_color: field(key: "text_color") {
      value
      }
      cta_color: field(key: "cta_color") {
      value
      }
      cta_url: field(key: "cta_url") {
      value
      }
      cta_text: field(key: "cta_text") {
      value
      }
      tagline: field(key: "tagline") {
      value
      }
      
    }
  }
}`

const FEATURED_COLLECTIONS_QUERY = `#graphql
query GetMetaObjects($type: String!) {
  metaobjects(first: 10, type: $type) {
    nodes {
      id
      handle
      media: field(key: "media") {
        reference {
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
          ... on Video {
            sources {
              mimeType
              url
            }
          }
        }
      }
      title: field(key: "title") {
        value
      }
      text_color: field(key: "text_color") {
        value
      }
      cta_color: field(key: "cta_color") {
        value
      }
      cta_url: field(key: "cta_url") {
        value
      }
      cta_text: field(key: "cta_text") {
        value
      }
      tagline: field(key: "tagline") {
        value
      }
      page: field(key: "page") {
        value
      }
      background_color: field(key: "background_color") {
        value
      }
      collection: field(key: "collection") {
        reference {
          ... on Collection {
          id
          title
          handle          
          }
        }
      }
    }
  }
}`

const FEATURED_COLLECTIONS = `#graphql
query {
  collections(first: 10) {
    nodes {
      id
      title
      handle
      image {
        id
        url(transform: {maxHeight:640})
        altText
        width
        height
      }
    }
  }
}`
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
