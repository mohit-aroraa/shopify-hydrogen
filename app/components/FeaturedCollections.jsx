export default (props) => {
  const {collections} = props;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <div key={collection.id}>
          <img
            className="w-full mx-auto object-contain aspect-square"
            src={`${collection.image?.url}`}
            alt={collection.image?.altText}
          />
          <div>
            <h3>{collection.title}</h3>
            <p>{collection.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
