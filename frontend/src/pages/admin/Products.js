// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiStar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
// import { productAPI, categoryAPI } from '../../services/api';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import toast from 'react-hot-toast';

// export const AdminProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [total, setTotal] = useState(0);

//   const fetch = async () => {
//     setLoading(true);
//     try {
//       const { data } = await productAPI.getAdminAll({ search, page, limit: 15 });
//       setProducts(data.products);
//       setPages(data.pages);
//       setTotal(data.total);
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetch(); }, [search, page]);

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this product?')) return;
//     try {
//       await productAPI.delete(id);
//       toast.success('Product deleted');
//       fetch();
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//   };

//   const handleToggleFeatured = async (id) => {
//     try {
//       const { data } = await productAPI.toggleFeatured(id);
//       setProducts(prev => prev.map(p => p._id === id ? { ...p, isFeatured: data.isFeatured } : p));
//     } catch { toast.error('Failed'); }
//   };

//   return (
//     <div className="p-4 sm:p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
//           <p className="text-sm text-gray-500">{total} total products</p>
//         </div>
//         <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
//           <FiPlus size={16} /> Add Product
//         </Link>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
//         <div className="p-4 border-b border-gray-50">
//           <div className="relative max-w-sm">
//             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//             <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
//               placeholder="Search products..." className="input-field pl-9 text-sm py-2.5" />
//           </div>
//         </div>

//         {loading ? <LoadingSpinner /> : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                 <tr>
//                   <th className="px-4 py-3 text-left">Product</th>
//                   <th className="px-4 py-3 text-left">Category</th>
//                   <th className="px-4 py-3 text-left">Price</th>
//                   <th className="px-4 py-3 text-left">Stock</th>
//                   <th className="px-4 py-3 text-left">Rating</th>
//                   <th className="px-4 py-3 text-left">Featured</th>
//                   <th className="px-4 py-3 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {products.map(p => (
//                   <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <img src={p.images?.[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
//                         <div>
//                           <p className="font-medium text-gray-800 max-w-xs truncate">{p.name}</p>
//                           <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600">{p.category?.name}</td>
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="font-semibold text-gray-900">₹{(p.discountPrice || p.price).toLocaleString()}</p>
//                         {p.discountPrice && <p className="text-xs text-gray-400 line-through">₹{p.price.toLocaleString()}</p>}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`badge text-xs ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
//                         {p.stock === 0 ? 'Out' : p.stock}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-1 text-amber-500">
//                         <FiStar size={13} className="fill-amber-400" />
//                         <span className="text-xs text-gray-600">{p.rating.toFixed(1)} ({p.numReviews})</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <button onClick={() => handleToggleFeatured(p._id)} className={`text-xl transition-colors ${p.isFeatured ? 'text-primary-600' : 'text-gray-300'}`}>
//                         {p.isFeatured ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}
//                       </button>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex gap-2">
//                         <Link to={`/admin/products/edit/${p._id}`} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
//                           <FiEdit2 size={15} />
//                         </Link>
//                         <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
//                           <FiTrash2 size={15} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {products.length === 0 && <div className="text-center py-12 text-gray-500">No products found</div>}
//           </div>
//         )}

//         {pages > 1 && (
//           <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
//             <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Prev</button>
//             <span className="py-1.5 px-4 text-xs font-medium text-gray-600">{page}/{pages}</span>
//             <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Next</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminProducts;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';

import { productAPI, categoryAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState({});

  // ✅ Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prodData } = await productAPI.getAdminAll({ limit: 1000 });
      const { data: catData } = await categoryAPI.getAll();

      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  // ✅ Toggle featured
  const handleToggleFeatured = async (id) => {
    try {
      const { data } = await productAPI.toggleFeatured(id);
      setProducts(prev =>
        prev.map(p => p._id === id ? { ...p, isFeatured: data.isFeatured } : p)
      );
    } catch {
      toast.error('Failed');
    }
  };

  // ✅ Expand collapse
  const toggleExpand = (id) => {
    setExpandedParents(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ✅ Get products of subcategory
  const getProductsBySubCategory = (subCatId) => {
    return products.filter(p => p.category?._id === subCatId);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 sm:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products (Category Wise)</h1>
        <Link to="/admin/products/new" className="btn-primary px-4 py-2 text-sm">
          Add Product
        </Link>
      </div>

      {/* CATEGORY TREE */}
      <div className="space-y-6">

        {categories.map(parent => (
          <div key={parent._id} className="bg-gray-50 rounded-xl p-4">

            {/* PARENT HEADER */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleExpand(parent._id)}>
                  {expandedParents[parent._id] === false
                    ? <FiChevronRight />
                    : <FiChevronDown />}
                </button>

                <h2 className="font-bold text-lg">{parent.name}</h2>
              </div>
            </div>

            {/* SUBCATEGORIES */}
            {expandedParents[parent._id] !== false && (
              <div className="space-y-6">

                {parent.subCategories?.map(sub => {
                  const subProducts = getProductsBySubCategory(sub._id);

                  return (
                    <div key={sub._id} className="bg-white rounded-xl shadow-sm p-4">

                      {/* SUBCATEGORY TITLE */}
                      <h3 className="font-semibold text-gray-700 mb-3">
                        {sub.name}
                      </h3>

                      {/* PRODUCTS TABLE */}
                      {subProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                              <tr>
                                <th className="px-3 py-2 text-left">Product</th>
                                <th className="px-3 py-2 text-left">Price</th>
                                <th className="px-3 py-2 text-left">Stock</th>
                                <th className="px-3 py-2 text-left">Rating</th>
                                <th className="px-3 py-2 text-left">Featured</th>
                                <th className="px-3 py-2 text-left">Actions</th>
                              </tr>
                            </thead>

                            <tbody>
                              {subProducts.map(p => (
                                <tr key={p._id} className="border-t">

                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={p.images?.[0]?.url}
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                      <div>
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-xs text-gray-400">{p.sku}</p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-3 py-2">
                                    ₹{(p.discountPrice || p.price).toLocaleString()}
                                  </td>

                                  <td className="px-3 py-2">{p.stock}</td>

                                  <td className="px-3 py-2">
                                    ⭐ {p.rating?.toFixed(1)}
                                  </td>

                                  <td className="px-3 py-2">
                                    <button onClick={() => handleToggleFeatured(p._id)} className={`text-xl transition-colors ${p.isFeatured ? 'text-primary-600' : 'text-gray-300'}`}>
                                      {p.isFeatured ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}
                                    </button>
                                  </td>

                                  <td className="px-3 py-2">
                                    <div className="flex gap-2">
                                      <Link className='text-green-600 font-bold  hover:text-green-800'  to={`/admin/products/edit/${p._id}`}>
                                        <FiEdit2 size={15} />
                                      </Link>
                                      <button className='text-green-600 font-bold  hover:text-green-800'  onClick={() => handleDelete(p._id)}>
                                        <FiTrash2 size={15} />
                                      </button>
                                    </div>
                                  </td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No products in this sub-category
                        </p>
                      )}
                    </div>
                  );
                })}

              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
};

export default AdminProducts;
