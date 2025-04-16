import {useState, useRef, useEffect} from 'react';
import {Link, useFetcher} from '@remix-run/react';
import {useDebounce} from 'react-use';
import {MagnifyingGlassIcon, XMarkIcon} from '@heroicons/react/24/outline';

export default function SearchBarV2() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const fetcher = useFetcher();
  const [searchResults, setSearchResults] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Debounce the search term to avoid too many requests
  useDebounce(
    () => {
      if (searchTerm.length >= 2) {
        performSearch(searchTerm);
      } else {
        setSearchResults(null);
      }
    },
    300,
    [searchTerm]
  );

  const performSearch = (term) => {
    setIsFetching(true);
    fetcher.load(`/search?q=${encodeURIComponent(term)}&predictive=true`);
  };

  // Set the results when the fetch completes
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      setSearchResults(fetcher.data.result.items);
      setIsFetching(false);
    }
  }, [fetcher]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFocus = () => {
    setIsSearchOpen(true);
  };

  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults(null);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative z-20">
        <div className="relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            className="w-full px-10 bg-white py-2 border rounded-full focus:outline-none"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
          />
          <MagnifyingGlassIcon className="absolute left-3 w-5 h-5 text-gray-400" />
          {isSearchOpen && (
            <button onClick={handleClose} className="absolute right-3">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={handleClose} />
      )}

      {/* Search Results */}
      {isSearchOpen && searchResults && (
        <div className="absolute left-0 right-0 z-20 p-4 mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.products.length === 0 ? (
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {searchResults.products.map((product) => (
                <li key={product.id} className="py-2">
                  <Link
                    to={`/products/${product.handle}`}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded"
                    onClick={handleClose}
                  >
                    {product.selectedOrFirstAvailableVariant.image.url && (
                      <img
                        src={product.selectedOrFirstAvailableVariant.image.url}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-sm text-gray-500">
                        ${product.selectedOrFirstAvailableVariant.price.amount}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isFetching && (
        <div className="absolute left-0 right-0 z-20 p-4 mt-2 bg-white rounded-lg shadow-lg text-center">
          <p className="text-gray-500">Searching...</p>
        </div>
      )}
    </div>
  );
}
