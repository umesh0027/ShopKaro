

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiX, FiPlus, FiTrash2, FiArrowLeft, FiEdit2, FiCheck, FiChevronDown } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

/*  — clothing + shoe presets */
// const CLOTHING = ['XS','S','M','L','XL','XXL','XXXL'];
// const SHOES    = ['5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','12'];

import { getSizesForCategory, getSizeLabel, SIZE_PRESETS } from '../../utils/SizeConfig';

/* ── Color row component ── */
const ColorRow = ({ color, idx, onChange, onRemove, variantType, categorySizes = [] })  => {
  const [open, setOpen]   = useState(idx === 0);
  const [imgPrev, setImgPrev] = useState(color.previewUrls || []);
  const fileRef = useRef();

  const handleFiles = (files) => {
    const arr = Array.from(files);
    const previews = arr.map(f => URL.createObjectURL(f));
    setImgPrev(prev => [...prev, ...previews]);
    onChange(idx, 'newImages', [...(color.newImages || []), ...arr]);
  };

  const removePreview = (i) => {
    const newArr = imgPrev.filter((_,j)=>j!==i);
    setImgPrev(newArr);
    const newFiles = (color.newImages||[]).filter((_,j)=>j!==i);
    onChange(idx,'newImages',newFiles);
  };

  const updateSizeStock = (sizeLabel, field, val) => {
    const sizes = [...(color.sizes||[])];
    const si = sizes.findIndex(s=>s.label===sizeLabel);
    if(si>=0) { sizes[si]={...sizes[si],[field]:val}; }
    else      { sizes.push({label:sizeLabel,stock:0,[field]:val}); }
    onChange(idx,'sizes',sizes);
  };

  const getSizeVal = (label,field) => {
    const s=(color.sizes||[]).find(s=>s.label===label);
    return s?.[field]??'';
  };

  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-colors ${open?'border-primary-200 bg-primary-50/30':'border-gray-100 bg-white'}`}>
      {/* Color header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={()=>setOpen(!open)}>
        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0" style={{backgroundColor:color.hex||'#ccc'}}/>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">{color.name||'Untitled Color'}</p>
          <p className="text-xs text-gray-400">
            {color.sizes?.reduce((s,x)=>s+(Number(x.stock)||0),0)||color.stock||0} units ·{' '}
            {(color.images?.filter(i=>i.url).length || 0) + imgPrev.length} image
  {((color.images?.filter(i=>i.url).length || 0) + imgPrev.length) !== 1 ? 's' : ''}
            {/* {imgPrev.length} image{imgPrev.length!==1?'s':''} */}
          

          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={(e)=>{e.stopPropagation();onRemove(idx);}}
            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
            <FiTrash2 size={14}/>
          </button>
          <FiChevronDown size={16} className={`text-gray-400 transition-transform ${open?'rotate-180':''}`}/>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Color name + hex */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Color Name *</label>
              <input value={color.name} onChange={e=>onChange(idx,'name',e.target.value)}
                placeholder="e.g. Navy Blue" className="input-field text-sm py-2"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Color Hex</label>
              <div className="flex gap-2">
                <input type="color" value={color.hex||'#6366f1'} onChange={e=>onChange(idx,'hex',e.target.value)}
                  className="w-11 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"/>
                <input value={color.hex||''} onChange={e=>onChange(idx,'hex',e.target.value)}
                  placeholder="#6366f1" className="input-field text-sm py-2 flex-1 font-mono"/>
              </div>
            </div>
          </div>

          {/* Images for this color */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Images for this color</label>
            <div className="flex gap-2 flex-wrap">
              {/* Existing uploaded images */}
              {(color.images||[]).filter(i=>i.url).map((img,i)=>(
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                  <img src={img.url} alt="" className="w-full h-full object-cover"/>
                  <button type="button" onClick={()=>onChange(idx,'images',(color.images||[]).filter((_,j)=>j!==i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center text-xs">×</button>
                </div>
              ))}
              {/* New image previews */}
              {imgPrev.map((src,i)=>(
                <div key={`prev-${i}`} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-primary-200">
                  <img src={src} alt="" className="w-full h-full object-cover"/>
                  <button type="button" onClick={()=>removePreview(i)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center text-xs">×</button>
                </div>
              ))}
              {/* Upload button */}
              <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <FiUpload size={16} className="text-gray-400"/>
                <span className="text-xs text-gray-400 mt-0.5">Add</span>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e=>handleFiles(e.target.files)}/>
              </label>
            </div>
          </div>

          {/* Size-wise stock for this color */}
          
               {/* Size-wise stock for this color — dynamic from category */}
          {(variantType==='both') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Stock per Size
                {categorySizes.length === 0 && (
                  <span className="text-amber-500 ml-1">(Select a category with sizes first)</span>
                )}
              </label>
              {categorySizes.length > 0 ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {categorySizes.map(size=>(
                    <div key={size} className="text-center">
                      <span className="block text-xs font-bold text-gray-600 mb-1">{size}</span>
                      <input type="number" min="0" value={getSizeVal(size,'stock')}
                        onChange={e=>updateSizeStock(size,'stock',Number(e.target.value))}
                        placeholder="0"
                        className="w-full text-center border border-gray-200 rounded-lg py-1.5 text-xs focus:outline-none focus:border-primary-400"/>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-center">
                  No sizes configured for this category. Set size type in Category settings.
                </p>
              )}
            </div>
          )}


          {/* Simple stock for color-only */}
          {variantType==='color' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Stock for this color</label>
              <input type="number" min="0" value={color.stock||0}
                onChange={e=>onChange(idx,'stock',Number(e.target.value))}
                className="input-field text-sm py-2 w-32"/>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══ MAIN PRODUCT FORM ══ */
const ProductForm = () => {
  const { id }  = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [loading,     setLoading]     = useState(false);
  const [fetchLoading,setFetchLoading]= useState(isEdit);
  const [categories,  setCategories]  = useState([]);

  // Global images (shown when no color selected / variantType=none)
  const [existingImages, setExistingImages] = useState([]);
  const [newImages,      setNewImages]      = useState([]);
  const [previews,       setPreviews]       = useState([]);

  const [specs, setSpecs] = useState([{ key:'', value:'' }]);
  const [tags,  setTags]  = useState('');

   const [selectedCategory, setSelectedCategory] = useState(null);
  // Variant state
  const [variantType, setVariantType] = useState('none');
  const [colors, setColors] = useState([]); // [{name,hex,images:[],newImages:[],stock,sizes:[]}]
  const [sizes,  setSizes]  = useState([]); // [{label,stock,price}] — for size-only variant
  const [sizeInput, setSizeInput] = useState({ label:'', stock:0, price:'' });

  const [form, setForm] = useState({
    name:'', description:'', shortDescription:'',
    price:'', discountPrice:'', stock:'',
    category:'', isFeatured:false,
  });

  

  useEffect(() => {
  const init = async () => {
    // Fetch flat categories first
    const catRes = await categoryAPI.getAll({ active: true, flat: true });
    const allCats = catRes.data.categories;
    setCategories(allCats);

    if (!isEdit) return;
    setFetchLoading(true);
    try {
      const r = await productAPI.getOne(id);
      const p = r.data.product;
      setForm({
        name: p.name, description: p.description,
        shortDescription: p.shortDescription || '',
        price: p.price, discountPrice: p.discountPrice || '',
        stock: p.stock, category: p.category?._id || '', isFeatured: p.isFeatured,
      });
      setExistingImages(p.images || []);
      setSpecs(p.specifications?.length ? p.specifications : [{ key: '', value: '' }]);
      setTags(p.tags?.join(', ') || '');
      setVariantType(p.variantType || 'none');
      setColors((p.colors || []).map(c => ({ ...c, newImages: [] })));
      setSizes(p.sizes || []);

      // ✅ Fix: look up full category object (with sizeType) from flat list
      const catId = p.category?._id || p.category;
      const fullCat = allCats.find(c => c._id === catId);
      setSelectedCategory(fullCat || null);

      // Auto-set variant type if category has sizes
      if (fullCat?.sizeType && fullCat.sizeType !== 'none') {
        setVariantType(prev => prev === 'none' ? 'size' : prev);
      }
    } finally {
      setFetchLoading(false);
    }
  };
  init();
}, [id]);

  /* ── Global image handlers ── */
  const handleImageChange = (e)=>{
    const files = Array.from(e.target.files);
    setNewImages(prev=>[...prev,...files]);
    setPreviews(prev=>[...prev,...files.map(f=>URL.createObjectURL(f))]);
  };
  const removeNewImage = (i)=>{ setNewImages(p=>p.filter((_,j)=>j!==i)); setPreviews(p=>p.filter((_,j)=>j!==i)); };

  /* ── Color handlers ── */
  const addColor = ()=> setColors(p=>[...p,{name:'',hex:'#6366f1',images:[],newImages:[],stock:0,sizes:[]}]);
  const removeColor = (i)=> setColors(p=>p.filter((_,j)=>j!==i));
  const updateColor = (i, field, val)=> setColors(p=>p.map((c,j)=>j===i?{...c,[field]:val}:c));

  /* ── Size handlers ── */
  const addSize = ()=>{
    if(!sizeInput.label.trim()) return;
    setSizes(p=>[...p,{...sizeInput}]);
    setSizeInput({label:'',stock:0,price:''});
  };
  const togglePresetSize = (label)=>{
    if(sizes.find(s=>s.label===label)) setSizes(p=>p.filter(s=>s.label!==label));
    else setSizes(p=>[...p,{label,stock:10,price:''}]);
  };

  /* ── Submit ── */
  const handleSubmit = async (e)=>{
    e.preventDefault();
    if(!isEdit && newImages.length===0 && colors.every(c=>!c.newImages?.length)) {
      toast.error('Add at least one product image'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      fd.append('tags',JSON.stringify(tags.split(',').map(t=>t.trim()).filter(Boolean)));
      fd.append('specifications',JSON.stringify(specs.filter(s=>s.key&&s.value)));
      fd.append('variantType',variantType);

      // Global images
      newImages.forEach(img=>fd.append('images',img));

      // Colors — serialize without newImages File objects, attach files separately
      const colorsMeta = colors.map(c=>({
        name:c.name, hex:c.hex, stock:c.stock,
        images:c.images||[], sizes:c.sizes||[]
      }));
      fd.append('colors',JSON.stringify(colorsMeta));

      // Attach per-color images as colorImages_0, colorImages_1, etc.
      colors.forEach((c,i)=>{
        (c.newImages||[]).forEach(file=>fd.append(`colorImages_${i}`,file));
      });

      fd.append('sizes',JSON.stringify(sizes));

      if(isEdit){ await productAPI.update(id,fd); toast.success('Product updated!'); }
      else      { await productAPI.create(fd);     toast.success('Product created!'); }
      navigate('/admin/products');
    } catch(err){
      toast.error(err.response?.data?.message||'Failed to save product');
    } finally{ setLoading(false); }
  };

  if(fetchLoading) return <LoadingSpinner/>;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={()=>navigate('/admin/products')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <FiArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{isEdit?'Edit Product':'Add New Product'}</h1>
          <p className="text-sm text-gray-500">{isEdit?'Update product details':'Fill in details below'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* ── Left — Main Info ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                placeholder="e.g. Classic Cotton T-Shirt" className="input-field"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
              <input value={form.shortDescription} onChange={e=>setForm(p=>({...p,shortDescription:e.target.value}))}
                placeholder="Brief summary shown on product cards" className="input-field" maxLength={300}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description *</label>
              <textarea required rows={5} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                placeholder="Detailed product description..." className="input-field resize-none"/>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Pricing & Stock</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price (₹) *</label>
                <input required type="number" min="0" value={form.price}
                  onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" className="input-field"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Price (₹)</label>
                <input type="number" min="0" value={form.discountPrice}
                  onChange={e=>setForm(p=>({...p,discountPrice:e.target.value}))} placeholder="0" className="input-field"/>
                {form.price&&form.discountPrice&&Number(form.discountPrice)<Number(form.price)&&(
                  <p className="text-xs text-green-600 mt-1">
                    {Math.round(((form.price-form.discountPrice)/form.price)*100)}% off
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Stock *</label>
                <input required type="number" min="0" value={form.stock}
                  onChange={e=>setForm(p=>({...p,stock:e.target.value}))} placeholder="0" className="input-field"/>
                <p className="text-xs text-gray-400 mt-1">Auto-calculated from variants</p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════
              VARIANTS SECTION
          ═══════════════════════════ */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Product Variants</h2>
              <p className="text-xs text-gray-400">Set colors with their own images, sizes with individual stock</p>
            </div>

            {/* Variant type picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Variant Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {v:'none',  l:'No Variants',    icon:'📦'},
                  {v:'color', l:'Color Only',      icon:'🎨'},
                  {v:'size',  l:'Size Only',       icon:'📏'}, 
                  {v:'both',  l:'Color + Size',    icon:'✨'},
                ].map(opt=>(
                  <button key={opt.v} type="button" onClick={()=>setVariantType(opt.v)}
                    className={`py-3 px-3 rounded-xl text-xs font-semibold border-2 transition-all flex flex-col items-center gap-1 ${variantType===opt.v?'bg-gradient-to-br from-pink-400 to-yellow-500 text-white border-accent-400 shadow-sm':'bg-white text-gray-600 border-gray-200 hover:border-accent-400 hover:text-accent-600'}`}>
                    <span className="text-lg">{opt.icon}</span>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Color variant section ── */}
            {(variantType==='color'||variantType==='both') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800">Colors ({colors.length})</label>
                  <button type="button" onClick={addColor}
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition-colors">
                    <FiPlus size={14}/> Add Color
                  </button>
                </div>

                {colors.length===0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                    <p className="text-3xl mb-2">🎨</p>
                    <p className="text-sm text-gray-500">Click "Add Color" to start adding color variants</p>
                    <p className="text-xs text-gray-400 mt-1">Each color can have its own images and stock</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colors.map((color,i)=>(
                      <ColorRow key={i} color={color} idx={i}
                        onChange={updateColor} onRemove={removeColor} variantType={variantType}  categorySizes={getSizesForCategory(selectedCategory)}/>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Size-only section ── */}
            {(variantType==='size') && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-800">Sizes & Stock</label>
               
                   {/* Dynamic sizes from category — NO hardcoding! */}
                {getSizesForCategory(selectedCategory).length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400 font-medium">
                        {getSizeLabel(selectedCategory?.sizeType)} — Click to add
                      </p>
                      <button type="button"
                        onClick={()=>{
                          const allSizes = getSizesForCategory(selectedCategory);
                          const newSizes = allSizes.map(s => sizes.find(x=>x.label===s) || {label:s,stock:10,price:''});
                          setSizes(newSizes);
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                        + Add All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getSizesForCategory(selectedCategory).map(s=>(
                        <button key={s} type="button" onClick={()=>togglePresetSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all hover:scale-105 ${
                            sizes.find(x=>x.label===s)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-amber-700 font-medium">⚠️ No size type set for this category</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Go to <strong>Admin → Categories</strong> → Edit this category → Set a Size Type
                    </p>
                  </div>
                )}
                {/* Added sizes table */}
                {sizes.length>0 && (
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">Size</th>
                          <th className="px-4 py-2 text-left">Stock</th>
                          <th className="px-4 py-2 text-left">Price Override</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sizes.map((s,i)=>(
                          <tr key={i}>
                            <td className="px-4 py-2 font-bold text-gray-800">{s.label}</td>
                            <td className="px-4 py-2">
                              <input type="number" min="0" value={s.stock}
                                onChange={e=>setSizes(p=>p.map((x,j)=>j===i?{...x,stock:Number(e.target.value)}:x))}
                                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-400"/>
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" min="0" value={s.price||''}
                                onChange={e=>setSizes(p=>p.map((x,j)=>j===i?{...x,price:e.target.value}:x))}
                                placeholder="Optional ₹" className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-400"/>
                            </td>
                            <td className="px-4 py-2">
                              <button type="button" onClick={()=>setSizes(p=>p.filter((_,j)=>j!==i))}
                                className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><FiTrash2 size={13}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Custom size input */}
                <div className="flex gap-2">
                  <input placeholder="Custom size" value={sizeInput.label} onChange={e=>setSizeInput(p=>({...p,label:e.target.value}))}
                    className="input-field text-sm py-2 flex-1"/>
                  <input type="number" placeholder="Stock" value={sizeInput.stock} onChange={e=>setSizeInput(p=>({...p,stock:Number(e.target.value)}))}
                    className="input-field text-sm py-2 w-24"/>
                  <button type="button" onClick={addSize}
                    className="btn-primary py-2 px-4 text-sm whitespace-nowrap">+ Add</button>
                </div>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Specifications</h2>
              <button type="button" onClick={()=>setSpecs(p=>[...p,{key:'',value:''}])}
                className="text-sm text-primary-600 flex items-center gap-1 hover:text-primary-700">
                <FiPlus size={14}/> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((spec,i)=>(
                <div key={i} className="flex gap-2">
                  <input value={spec.key} onChange={e=>setSpecs(p=>p.map((s,j)=>j===i?{...s,key:e.target.value}:s))}
                    placeholder="Key e.g. Material" className="input-field text-sm py-2 flex-1"/>
                  <input value={spec.value} onChange={e=>setSpecs(p=>p.map((s,j)=>j===i?{...s,value:e.target.value}:s))}
                    placeholder="Value e.g. Cotton" className="input-field text-sm py-2 flex-1"/>
                  <button type="button" onClick={()=>setSpecs(p=>p.filter((_,j)=>j!==i))}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><FiTrash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Tags</h2>
            <input value={tags} onChange={e=>setTags(e.target.value)}
              placeholder="cotton, summer, casual (comma separated)" className="input-field"/>
          </div>
        </div>

        {/* ── Right — Images + Settings ── */}
        <div className="space-y-5">
          {/* Global Images */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">
              {variantType==='color'||variantType==='both' ? 'Fallback / Main Images' : 'Product Images'}
            </h2>
            {(variantType==='color'||variantType==='both') && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mb-3">
                💡 These are fallback images. Add color-specific images in each color section.
              </p>
            )}
            {/* Existing */}
            {existingImages.length>0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {existingImages.map((img,i)=>(
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img.url} alt="" className="w-full h-full object-cover"/>
                    <button type="button" onClick={async()=>{
                      try{ await productAPI.deleteImage(id,{public_id:img.public_id}); setExistingImages(p=>p.filter((_,j)=>j!==i)); toast.success('Image deleted'); }
                      catch{ toast.error('Failed to delete'); }
                    }} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <FiTrash2 className="text-white" size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* New previews */}
            {previews.length>0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {previews.map((src,i)=>(
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary-200">
                    <img src={src} alt="" className="w-full h-full object-cover"/>
                    <button type="button" onClick={()=>removeNewImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <FiX size={10} className="text-white"/>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
              <FiUpload size={22} className="text-gray-400 mx-auto mb-1.5"/>
              <p className="text-sm text-gray-500 font-medium">Click to upload</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden"/>
            </label>
          </div>

          {/* Category & Settings */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Category & Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
             

                <select required value={form.category} onChange={e=>{
                  setForm(p=>({...p,category:e.target.value}));
                  const cat = categories.find(c=>c._id.toString()===e.target.value);
                  setSelectedCategory(cat||null);
                  if(cat?.sizeType && cat.sizeType!=='none') {
                    setVariantType(prev => prev==='none' ? 'size' : prev);
                  }
                }} className="input-field">
                <option value="">Select category</option>
                {/* Group: parent categories first as optgroup */}
                {categories.filter(c=>c.level===0).map(parent=>{
                  const children = categories.filter(c=>
                    c.level===1 && (c.parent?._id||c.parent)===parent._id
                  );
                  return children.length > 0 ? (
                    <optgroup key={parent._id} label={parent.name}>
                      {children.map(child=>(
                        <option key={child._id} value={child._id}>
                          {child.name}
                          {child.sizeType&&child.sizeType!=='none'?` • ${getSizeLabel(child.sizeType)}`:''}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <option key={parent._id} value={parent._id}>
                      {parent.name}
                    </option>
                  );
                })}
                {/* Standalone categories (no children, no parent match) */}
                {categories.filter(c=>
                  c.level===0 && !categories.some(ch=>ch.level===1&&(ch.parent?._id||ch.parent)===c._id)
                ).length===0 ? null :
                  categories.filter(c=>c.level===1&&!c.parent).map(c=>(
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))
                }
              </select>
              {selectedCategory?.sizeType && selectedCategory.sizeType!=='none' && (
                <div className="mt-1.5 flex items-center gap-2 text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl">
                  📏 <span>Size type: <strong>{getSizeLabel(selectedCategory.sizeType)}</strong> — sizes will auto-load in Variants</span>
                </div>
              )}
              {selectedCategory && (!selectedCategory.sizeType || selectedCategory.sizeType==='none') && (
                <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                  ⚠️ No size type set for this category. Go to Categories → Edit to add sizes.
                </p>
              )}

            </div>
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
              <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(p=>({...p,isFeatured:e.target.checked}))}
                className="w-4 h-4 text-primary-600 rounded"/>
              <div>
                <p className="text-sm font-medium text-gray-700">Featured Product</p>
                <p className="text-xs text-gray-400">Show on homepage</p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
              : <><FiCheck size={16}/>{isEdit?'Update Product':'Create Product'}</>
            }
          </button>
          <button type="button" onClick={()=>navigate('/admin/products')} className="btn-secondary w-full py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
