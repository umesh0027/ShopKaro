

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiStar, FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiMinus, FiPlus, FiZoomIn, FiX,
  FiShare2, FiCopy, FiCheck, FiInfo
} from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook } from 'react-icons/fa';
import { HiHeart } from 'react-icons/hi2';
import { productAPI, userAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import toast from 'react-hot-toast';

/* ─── Image Zoom Lightbox ─── */
const ImageZoom = ({ src, alt, onClose }) => {
  const [scale, setScale]   = useState(1);
  const [pos, setPos]       = useState({ x:0, y:0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x:0, y:0 });
  const lastTouchDist = useRef(null);

  const zoomIn  = ()=> setScale(s=>Math.min(s+0.5,4));
  const zoomOut = ()=> setScale(s=>{ const n=Math.max(s-0.5,1); if(n===1) setPos({x:0,y:0}); return n; });
  const reset   = ()=> { setScale(1); setPos({x:0,y:0}); };

  useEffect(()=>{
    const h=(e)=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[onClose]);

  const onWheel = useCallback((e)=>{
    e.preventDefault();
    if(e.deltaY<0) setScale(s=>Math.min(s+0.2,4));
    else setScale(s=>{ const n=Math.max(s-0.2,1); if(n===1) setPos({x:0,y:0}); return n; });
  },[]);

  return (
    <div className="fixed inset-0 z-50 bg-black/92 flex flex-col"
      onWheel={onWheel} onMouseMove={e=>dragging&&setPos({x:e.clientX-dragStart.x,y:e.clientY-dragStart.y})}
      onMouseUp={()=>setDragging(false)} onMouseLeave={()=>setDragging(false)}
      onTouchMove={e=>{ if(e.touches.length===2){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); if(lastTouchDist.current) setScale(s=>Math.min(Math.max(s+(d-lastTouchDist.current)*0.01,1),4)); lastTouchDist.current=d; }}}
      onTouchEnd={()=>{ lastTouchDist.current=null; }}>
      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/60 z-10">
        <div className="flex items-center gap-3">
          <button onClick={zoomOut} disabled={scale<=1} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 text-xl">−</button>
          <span className="text-white text-sm font-mono w-14 text-center">{Math.round(scale*100)}%</span>
          <button onClick={zoomIn} disabled={scale>=4} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 text-xl">+</button>
          {scale>1&&<button onClick={reset} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs">Reset</button>}
        </div>
        <p className="text-white/40 text-xs hidden sm:block">Scroll to zoom · Drag to pan</p>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/70 flex items-center justify-center text-white transition-colors"><FiX size={18}/></button>
      </div>
      {/* Image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden"
        style={{cursor:scale>1?(dragging?'grabbing':'grab'):'zoom-in'}}
        onMouseDown={e=>{ if(scale<=1) return; setDragging(true); setDragStart({x:e.clientX-pos.x,y:e.clientY-pos.y}); }}
        onClick={scale===1?zoomIn:undefined}>
        <img src={src} alt={alt} draggable={false} className="max-w-none select-none"
          style={{transform:`scale(${scale}) translate(${pos.x/scale}px,${pos.y/scale}px)`,maxHeight:'88vh',maxWidth:'88vw'}}/>
      </div>
      <p className="text-white/30 text-xs text-center pb-3">Click or scroll to zoom · Pinch on mobile</p>
    </div>
  );
};

/* ─── Share Button ─── */
const ShareButton = ({ product }) => {
  const [open, setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const url = window.location.href;
  const text = `Check out ${product.name} on ShopKaro!`;

  useEffect(()=>{
    const handler=(e)=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',handler);
    return ()=>document.removeEventListener('mousedown',handler);
  },[]);

  const copyLink = async()=>{
    try{
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(()=>setCopied(false),2000);
    } catch{ toast.error('Could not copy link'); }
  };

  const shareOptions = [
    {
      label:'WhatsApp', icon:FaWhatsapp, color:'#25D366',
      action:()=>window.open(`https://wa.me/?text=${encodeURIComponent(text+' '+url)}`)
    },
    {
      label:'Twitter/X', icon:FaTwitter, color:'#1DA1F2',
      action:()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
    },
    {
      label:'Facebook', icon:FaFacebook, color:'#1877F2',
      action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
    },
  ];

  // Native share API (mobile)
  // const handleNativeShare = async()=>{
  //   if(navigator.share){
  //     try{
  //       await navigator.share({ title:product.name, text, url });
  //     } catch(e){ if(e.name!=='AbortError') setOpen(!open); }
  //   } else {
  //     setOpen(!open);
  //   }
  // };
  const handleNativeShare = async () => {
  if (navigator.share) {
    try {
      let files = [];

      // Try to convert image URL to file
      if (product?.images?.[0]?.url || product?.images?.[0]) {
        const imgUrl = product.images[0].url || product.images[0];

        const response = await fetch(imgUrl);
        const blob = await response.blob();

        const file = new File([blob], "product.jpg", { type: blob.type });
        files = [file];
      }

      await navigator.share({
        title: product.name,
        text,
        url,
        files // ✅ THIS is key
      });

    } catch (e) {
      if (e.name !== 'AbortError') {
        setOpen(!open);
      }
    }
  } else {
    setOpen(!open);
  }
};

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent-400 hover:border-accent-400 hover:bg-gradient-to-br from-pink-400 to-yellow-500 text-sm font-medium text-gray-600 hover:text-white transition-all group">
        <FiShare2 size={16} className="group-hover:rotate-12 transition-transform"/>
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-scale-in">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Share via</p>

          {/* Social options */}
          {shareOptions.map(opt=>(
            <button key={opt.label} onClick={()=>{ opt.action(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{backgroundColor:opt.color+'20'}}>
                <opt.icon size={16} style={{color:opt.color}}/>
              </div>
              <span className="text-sm font-medium text-gray-700">{opt.label}</span>
            </button>
          ))}

          <div className="border-t border-gray-100 my-2"/>

          {/* Copy link */}
          <button onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              {copied ? <FiCheck size={15} className="text-green-600"/> : <FiCopy size={14} className="text-gray-600"/>}
            </div>
            <span className="text-sm font-medium text-gray-700">{copied?'Copied!':'Copy Link'}</span>
          </button>

          {/* URL preview */}
          <div className="mt-2 px-3 py-2 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 truncate font-mono">{url.replace('https://','')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════
   MAIN PRODUCT DETAIL
══════════════════════════════════ */
const ProductDetail = () => {
  const { id }     = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn, user ,isAdmin} = useAuth();

  const [product,     setProduct]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity,    setQuantity]    = useState(1);
  const [activeTab,   setActiveTab]   = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [zoomOpen,    setZoomOpen]    = useState(false);
  const [hoverZoom,   setHoverZoom]   = useState(false);
  const [mousePos,    setMousePos]    = useState({x:50,y:50});

  // Variant selectors
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize,  setSelectedSize]  = useState(null);

  // Review form
  const [reviewForm,  setReviewForm]  = useState({rating:5,comment:''});
  const [submittingReview, setSubmittingReview] = useState(false);

  const imgContainerRef = useRef(null);

  /* Current images to display — color-specific or global */
  const displayImages = React.useMemo(()=>{
    if(selectedColor?.images?.length) return selectedColor.images;
    return product?.images || [];
  },[selectedColor, product]);

  /* Available sizes for selected color */
  const availableSizes = React.useMemo(()=>{
    if(!product) return [];
    if(product.variantType==='both' && selectedColor?.sizes?.length) return selectedColor.sizes;
    if(product.variantType==='size') return product.sizes||[];
    return [];
  },[product, selectedColor]);

  /* Stock for selected variant */
  const currentStock = React.useMemo(()=>{
    if(!product) return 0;
    if(product.variantType==='both' && selectedColor && selectedSize){
      const s=availableSizes.find(s=>s.label===selectedSize);
      return s?.stock ?? 0;
    }
    if(product.variantType==='color' && selectedColor) return selectedColor.stock ?? 0;
    if(product.variantType==='size' && selectedSize){
      const s=availableSizes.find(s=>s.label===selectedSize);
      return s?.stock ?? 0;
    }
    return product.stock ?? 0;
  },[product, selectedColor, selectedSize, availableSizes]);

  /* Price override per size */
  const currentPrice = React.useMemo(()=>{
    if(!product) return 0;
    if(selectedColor && selectedSize){
      const s=availableSizes.find(s=>s.label===selectedSize);
      if(s?.price) return s.price;
    }
    if(selectedSize && product.variantType==='size'){
      const s=availableSizes.find(s=>s.label===selectedSize);
      if(s?.price) return s.price;
    }
    return product.discountPrice || product.price;
  },[product, selectedColor, selectedSize, availableSizes]);

  /* Load product */
  useEffect(()=>{
    setLoading(true);
    setSelectedColor(null); setSelectedSize(null); setActiveImage(0);
    productAPI.getOne(id).then(r=>{
      const p=r.data.product;
      setProduct(p);
      setRelated(r.data.related);
      // Init first color/size
      if(p.colors?.length) setSelectedColor(p.colors[0]);
      if(p.variantType==='size'&&p.sizes?.length) setSelectedSize(p.sizes[0].label);
      if(isLoggedIn&&user){
        userAPI.getWishlist().then(wr=>setIsWishlisted(wr.data.wishlist.some(x=>x._id===p._id))).catch(()=>{});
      }
    }).catch(()=>toast.error('Product not found')).finally(()=>setLoading(false));
  },[id]);

  /* When color changes, reset image + auto-select first size */
  const handleColorSelect = (color)=>{
    setSelectedColor(color);
    setActiveImage(0);
    setQuantity(1);
    // Auto-select first available size for this color
    if(product?.variantType==='both'&&color.sizes?.length){
      const first=color.sizes.find(s=>s.stock>0);
      setSelectedSize(first?.label||null);
    }
  };

  const handleMouseMove = (e)=>{
    if(!imgContainerRef.current) return;
    const rect=imgContainerRef.current.getBoundingClientRect();
    setMousePos({
      x:Math.max(0,Math.min(100,((e.clientX-rect.left)/rect.width)*100)),
      y:Math.max(0,Math.min(100,((e.clientY-rect.top)/rect.height)*100)),
    });
  };

  const handleAddToCart = ()=>{
   if (isAdmin) { toast.error('Admin cannot add items to cart'); return; }
    if(product.variantType!=='none'){
      if((product.variantType==='color'||product.variantType==='both')&&!selectedColor){
        toast.error('Please select a color'); return;
      }
      if((product.variantType==='size'||product.variantType==='both')&&!selectedSize){
        toast.error('Please select a size'); return;
      }
    }
    if(currentStock===0){ toast.error('Out of stock'); return; }

     // Get image for selected color
    // const colorImage = selectedColor?.images?.[0]?.url
    //   || selectedColor?.images?.[0]
    //   || product.images?.[0]?.url
    //   || '';


   // Use currently visible (active) image — exactly what user sees in gallery
    // displayImages is color-specific when color selected, else global images
    const activeImg = displayImages[activeImage];
    const cartImage = activeImg?.url    // {url, public_id} object
      || activeImg              // plain string URL
      || selectedColor?.images?.[0]?.url
      || selectedColor?.images?.[0]
      || product.images?.[0]?.url
      || '';

    
    addToCart({
       ...product,
      price: currentPrice,
      originalPrice: product.price,
      selectedColor:    selectedColor?.name || null,
      selectedColorHex: selectedColor?.hex  || null,
      selectedSize:     selectedSize         || null,
      stock: currentStock,
      image: cartImage,   // exact image user is looking at
    }, quantity);
  };

  const handleWishlist = async()=>{
    if(!isLoggedIn){ toast.error('Please login first'); return; }
     if (isAdmin) {
    toast.error('Admin cannot wishlist products');
    return;
  }
    await userAPI.toggleWishlist(product._id);
    setIsWishlisted(p=>!p);
    toast.success(isWishlisted?'Removed from wishlist':'Added to wishlist');
  };

  const handleReview = async(e)=>{
    e.preventDefault();
    if(!isLoggedIn){ toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try{
      const {data}=await productAPI.addReview(product._id, reviewForm);
      setProduct(data.product);
      setReviewForm({rating:5,comment:''});
      toast.success('Review added!');
    }catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setSubmittingReview(false); }
  };

  const discount = product
    ? product.discountPrice ? Math.round(((product.price-product.discountPrice)/product.price)*100) : 0
    : 0;

  if(loading) return <div className="pt-16"><LoadingSpinner/></div>;
  if(!product) return <div className="pt-20 text-center">Product not found</div>;

  return (
    <div className="pt-20 pb-16">
      {zoomOpen&&<ImageZoom src={displayImages[activeImage]?.url||displayImages[activeImage]} alt={product.name} onClose={()=>setZoomOpen(false)}/>}

      <div className="page-container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary-600">Home</Link><span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          {product.category&&<><span>/</span><Link to={`/products?category=${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link></>}
          <span>/</span><span className="text-gray-700 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* ══ IMAGE GALLERY ══ */}
          <div>
            {/* Main image */}
            <div ref={imgContainerRef}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 cursor-zoom-in select-none"
              onMouseEnter={()=>setHoverZoom(true)} onMouseLeave={()=>setHoverZoom(false)}
              onMouseMove={handleMouseMove} onClick={()=>setZoomOpen(true)}>

              {displayImages[activeImage] ? (
                <img
                  key={displayImages[activeImage]?.url||displayImages[activeImage]}
                  src={displayImages[activeImage]?.url||displayImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-opacity duration-300"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <FiZoomIn size={48}/>
                </div>
              )}

              {/* Hover magnifier */}
              {hoverZoom&&displayImages[activeImage]&&(
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage:`url(${displayImages[activeImage]?.url||displayImages[activeImage]})`,
                  backgroundSize:'280%',
                  backgroundPosition:`${mousePos.x}% ${mousePos.y}%`,
                  backgroundRepeat:'no-repeat',
                }}/>
              )}

              {/* Badges */}
              {discount>0&&<span className="absolute top-3 left-3 badge bg-red-500 text-white z-10">{discount}% OFF</span>}
              {selectedColor&&<span className="absolute top-3 right-12 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">{selectedColor.name}</span>}
              <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none z-10">
                <FiZoomIn size={11}/><span className="hidden sm:inline">Zoom</span>
              </div>

              {/* Prev/Next arrows */}
              {displayImages.length>1&&(
                <>
                  <button onClick={e=>{e.stopPropagation();setActiveImage(p=>(p-1+displayImages.length)%displayImages.length);}}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm z-10 transition-all">
                    <FiChevronLeft size={18}/>
                  </button>
                  <button onClick={e=>{e.stopPropagation();setActiveImage(p=>(p+1)%displayImages.length);}}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm z-10 transition-all">
                    <FiChevronRight size={18}/>
                  </button>
                </>
              )}

              {/* Image counter dot */}
              {displayImages.length>1&&(
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {displayImages.map((_,i)=>(
                    <button key={i} onClick={e=>{e.stopPropagation();setActiveImage(i);}}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${activeImage===i?'bg-white w-4':'bg-white/50'}`}/>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {displayImages.length>1&&(
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {displayImages.map((img,i)=>(
                  <button key={i} onClick={()=>setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all hover:border-primary-400 ${activeImage===i?'border-primary-500 ring-2 ring-primary-100':'border-transparent'}`}>
                    <img src={img?.url||img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}

            {/* Color thumbnails quick preview */}
            {product.variantType!=='none'&&product.colors?.length>1&&(
              <div className="flex gap-2 mt-3 flex-wrap">
                {product.colors.map((color,i)=>{
                  const firstImg=color.images?.[0]?.url||color.images?.[0];
                  return (
                    <button key={i} onClick={()=>handleColorSelect(color)}
                      title={color.name}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${selectedColor?.name===color.name?'border-primary-500 ring-2 ring-primary-100':'border-gray-200'}`}>
                      {firstImg &&
                        // ? <img src={firstImg} alt={color.name} className="w-full h-full object-cover"/>
                         <div className="w-full h-full" style={{backgroundColor:color.hex||'#ccc'}}/>
                      }
                    </button>
                  );
                })}
              </div>
            )}

            {/* Zoom button */}
            <button onClick={()=>setZoomOpen(true)}
              className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <FiZoomIn size={15}/> Click image to zoom · Hover to preview
            </button>
          </div>

          {/* ══ PRODUCT INFO ══ */}
          <div>
            {/* Title row */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                {product.category&&(
                  <Link to={`/products?category=${product.category.slug}`}
                    className="text-xs font-semibold text-primary-600 uppercase tracking-wider hover:text-primary-700">
                    {product.category.name}
                  </Link>
                )}
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-1 leading-tight">
                  {product.name}
                </h1>
              </div>
              {/* Share button */}
              <div className="shrink-0 mt-1">
                <ShareButton product={product}/>
              </div>
            </div>

            {/* Rating */}
            {product.numReviews>0&&(
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(s=>(
                    <FiStar key={s} size={15} className={s<=Math.round(product.rating)?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}/>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                <button onClick={()=>setActiveTab('reviews')} className="text-sm text-gray-500 hover:text-primary-600 underline-offset-2 hover:underline">
                  ({product.numReviews} reviews)
                </button>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-1">
              <span className="font-display text-3xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</span>
              {product.discountPrice&&currentPrice!==product.price&&(
                <>
                  <span className="text-lg text-gray-400 line-through mb-0.5">₹{product.price.toLocaleString()}</span>
                  <span className="badge bg-red-100 text-red-600 font-bold mb-0.5">{discount}% OFF</span>
                </>
              )}
            </div>
            {product.discountPrice&&(
              <p className="text-green-600 text-sm font-medium mb-4">You save ₹{(product.price-product.discountPrice).toLocaleString()}</p>
            )}

            {product.shortDescription&&(
              <p className="text-gray-600 mb-5 leading-relaxed text-sm">{product.shortDescription}</p>
            )}

            {/* ── COLOR SELECTOR ── */}
            {(product.variantType==='color'||product.variantType==='both')&&product.colors?.length>0&&(
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold text-gray-800">Color:</p>
                  {selectedColor&&(
                    <span className="text-sm text-primary-600 font-bold">{selectedColor.name}</span>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color,i)=>{
                    const firstImg=color.images?.[0]?.url||color.images?.[0];
                    const isSelected=selectedColor?.name===color.name;
                    const outOfStock=color.stock===0&&product.variantType==='color';
                    return (
                      <button key={i} onClick={()=>!outOfStock&&handleColorSelect(color)}
                        disabled={outOfStock}
                        title={color.name}
                        className={`group relative flex flex-col items-center gap-1.5 transition-all ${outOfStock?'opacity-40 cursor-not-allowed':''}`}>
                        {/* Swatch */}
                        <div className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${isSelected?'border-primary-500 ring-2 ring-primary-100 scale-105':'border-gray-200 hover:border-gray-400'}`}>
                          {firstImg &&
                            // ? <img src={firstImg} alt={color.name} className="w-full h-full object-cover"/>
                             <div className="w-full h-full" style={{backgroundColor:color.hex||'#ccc'}}/>
                          }
                          {isSelected&&(
                            <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                              <FiCheck size={16} className="text-primary-700 font-bold"/>
                            </div>
                          )}
                          {outOfStock&&(
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <span className="w-8 h-0.5 bg-gray-400 rotate-45 rounded-full block"/>
                            </div>
                          )}
                        </div>
                        {/* Color name */}
                        <span className={`text-xs font-medium ${isSelected?'text-primary-600':'text-gray-500'}`}>
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SIZE SELECTOR ── */}
            {availableSizes.length>0&&(
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">Size:</p>
                    {selectedSize&&(
                      <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">{selectedSize}</span>
                    )}
                  </div>
                  <button className="text-xs text-accent-400 hover:text-primary-600 flex items-center gap-1 transition-colors">
                    <FiInfo size={12}/> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size,i)=>{
                    const isSelected=selectedSize===size.label;
                    const isOOS=size.stock===0;
                    const isLow=size.stock>0&&size.stock<=3;
                    return (
                      <button key={i} onClick={()=>!isOOS&&setSelectedSize(size.label)}
                        disabled={isOOS}
                        className={`relative px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          isSelected ? 'bg-primary-600 text-white border-primary-600 shadow-sm scale-105'
                          : isOOS    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-primary-600 hover:scale-105'
                        }`}>
                        {size.label}
                        {/* Stock indicators */}
                        {isLow&&!isSelected&&(
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" title="Low stock"/>
                        )}
                        {isOOS&&(
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-400 border border-white"/>
                        )}
                        {/* Price override badge */}
                        {size.price&&size.price!==product.discountPrice&&size.price!==product.price&&(
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-green-100 text-green-700 px-1 rounded whitespace-nowrap">₹{size.price}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Size status */}
                {selectedSize&&(
                  <div className="mt-2">
                    {(()=>{
                      const s=availableSizes.find(s=>s.label===selectedSize);
                      if(!s) return null;
                      if(s.stock===0) return <p className="text-xs text-red-500 flex items-center gap-1"><span>❌</span> Out of stock in {selectedSize}</p>;
                      if(s.stock<=3) return <p className="text-xs text-amber-600 flex items-center gap-1"><span>⚠️</span> Only {s.stock} left in size {selectedSize}!</p>;
                      return <p className="text-xs text-green-600 flex items-center gap-1"><span>✅</span> Available in {selectedSize}</p>;
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`w-2.5 h-2.5 rounded-full ${currentStock>10?'bg-green-500':currentStock>0?'bg-amber-500':'bg-red-500'}`}/>
              <span className={`text-sm font-medium ${currentStock>10?'text-green-700':currentStock>0?'text-amber-700':'text-red-700'}`}>
                {currentStock>10?'In Stock':currentStock>0?`Only ${currentStock} left!`:'Out of Stock'}
              </span>
              {currentStock>0&&<span className="text-xs text-gray-400 ml-2">SKU: {product.sku}</span>}
            </div>

            {/* Quantity + Cart + Wishlist */}
            {currentStock>0&&(
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button onClick={()=>setQuantity(q=>Math.max(1,q-1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition-colors text-gray-600">
                    <FiMinus size={14}/>
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                  <button onClick={()=>setQuantity(q=>Math.min(currentStock,q+1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition-colors text-gray-600">
                    <FiPlus size={14}/>
                  </button>
                </div>
                <button onClick={handleAddToCart}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 min-w-40">
                  <FiShoppingCart size={18}/> Add to Cart
                </button>
                <button onClick={handleWishlist}
                  className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors">
                  {isWishlisted?<HiHeart className="text-red-500" size={20}/>:<FiHeart size={18} className="text-gray-600"/>}
                </button>
              </div>
            )}
            {currentStock===0&&(
              <div className="flex gap-3 mb-6">
                <button disabled className="btn-primary flex-1 py-2.5 opacity-50 cursor-not-allowed">Out of Stock</button>
                <button onClick={handleWishlist}
                  className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors">
                  {isWishlisted?<HiHeart className="text-red-500" size={20}/>:<FiHeart size={18} className="text-gray-600"/>}
                </button>
              </div>
            )}

            {/* Feature badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {icon:FiTruck,    text:'Free Delivery',   sub:'Above ₹499'},
                {icon:FiShield,   text:'Secure Payment',  sub:'Razorpay'},
                {icon:FiRefreshCw,text:'7 Day Return',    sub:'Easy returns'},
              ].map(f=>(
                <div key={f.text} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                  <f.icon size={18} className="text-primary-600"/>
                  <span className="text-xs font-semibold text-gray-700">{f.text}</span>
                  <span className="text-xs text-gray-400">{f.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="mt-14">
          <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
            {[
              {id:'description',label:'Description'},
              {id:'specs',      label:'Specifications'},
              {id:'reviews',    label:`Reviews (${product.numReviews})`},
            ].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab===tab.id?'border-primary-600 text-primary-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab==='description'&&(
            <div className="prose max-w-none text-gray-600 leading-relaxed text-sm">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab==='specs'&&(
            <div className="grid sm:grid-cols-2 gap-3">
              {product.specifications?.length
                ? product.specifications.map((spec,i)=>(
                  <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-sm text-gray-700 min-w-32 shrink-0">{spec.key}</span>
                    <span className="text-sm text-gray-600">{spec.value}</span>
                  </div>
                ))
                : <p className="text-gray-400 col-span-2">No specifications</p>
              }
            </div>
          )}



          {activeTab==='reviews'&&(
            <div>
              {isLoggedIn&&(
                <div className="card mb-8">
                  <h3 className="font-display font-semibold text-lg mb-4">Write a Review</h3>
                  <form onSubmit={handleReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s=>(
                          <button key={s} type="button" onClick={()=>setReviewForm(p=>({...p,rating:s}))}
                            className={`text-3xl transition-transform hover:scale-110 ${s<=reviewForm.rating?'text-amber-400':'text-gray-200'}`}>★</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <textarea value={reviewForm.comment} onChange={e=>setReviewForm(p=>({...p,comment:e.target.value}))}
                        rows={4} className="input-field resize-none" placeholder="Share your experience..." required/>
                    </div>
                    <button type="submit" disabled={submittingReview} className="btn-primary py-2.5">
                      {submittingReview?'Submitting...':'Submit Review'}
                    </button>
                  </form>
                </div>
              )}
              {product.reviews?.length
                ? <div className="space-y-4">
                    {product.reviews.map(review=>(
                      <div key={review._id} className="card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full flex items-center justify-center shrink-0">
                              <span className="font-bold text-white text-sm">{review.name[0]}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{review.name}</p>
                              <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                            </div>
                          </div>
                          <div className="flex">{[1,2,3,4,5].map(s=><span key={s} className={s<=review.rating?'text-amber-400':'text-gray-200'}>★</span>)}</div>
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                        {review.adminReply&&(
                          <div className="mt-3 pl-4 border-l-2 border-primary-200 bg-primary-50 rounded-r-xl p-3">
                            <p className="text-xs font-semibold text-primary-700 mb-1">ShopKaro Response</p>
                            <p className="text-sm text-gray-700">{review.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                : <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">💬</p>
                    <p>No reviews yet. Be the first!</p>
                  </div>
              }
            </div>
          )}
        </div>

        {/* ══ RELATED PRODUCTS ══ */}
        {related.length>0&&(
          <div className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-primary-600 font-semibold text-sm mb-1">You may also like</p>
                <h2 className="font-display text-2xl font-bold text-gray-900">Related Products</h2>
              </div>
              {product.category&&(
                <Link to={`/products?category=${product.category.slug}`}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1">
                  See all in {product.category.name} →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map(p=><ProductCard key={p._id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
