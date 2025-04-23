import { Link } from "@remix-run/react";
export default (props) => {
  const {collections} = props;
  return (
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-10 justify-center">
      {collections.map((collection) => (
        <div style={{ backgroundColor: collection.background_color.value }} className="rounded-2xl p-4" key={collection.id}>
         <img src={collection.media?.reference?.image?.url} alt="featured collection" />
         <div className="text-center space-y-3 py-8">
          <div className="text-sm font-light">{collection.tagline.value}</div>
          <div className="text-4xl font-bold mb-8">{collection.title.value}</div>
          <div>
          <Link to={`/collections/${collection.collection.reference.handle}`} className="px-8 py-4 !text-white rounded-full bg-emerald-950">
            View Collection
          </Link>
          </div>
         </div>
        </div>
      ))}
    </div>
  );
};
