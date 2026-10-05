import React, { useEffect, useState, useContext } from 'react';
import { GlobleInfo } from '../../App';
import { Link, useParams } from 'react-router-dom';
import { SERVER_API_URL } from '../../server/server';
import axios from 'axios';

import Header from "../../components/Header";
import { LuArrowDownUp } from "react-icons/lu";
import wishlist from '../../Assets/images/wishlist.svg'
import wishlist1 from '../../Assets/images/wishlist1.svg'


import "./index.css";



const Jewellery = () => {
    const { gender, Item_Name } = useParams();
    const [allProducts, setAllProducts] = useState([]);
    // const [filteredProducts, setFilteredProducts] = useState([]);
    const { updateCounts } = useContext(GlobleInfo);
    const [hoveredImages, setHoveredImages] = useState({});

    // const [sortOption, setSortOption] = useState('Price: High to Low');
    const [sortOption, setSortOption] = useState('Price: All');
    const [wishlistItems, setWishlistItems] = useState([]);

    const handleMouseEnter = (productId, hoverImage) => {
        setHoveredImages((prev) => ({
            ...prev,
            [productId]: hoverImage,
        }));
    };

    const handleMouseLeave = (productId, defaultImage) => {
        setHoveredImages((prev) => ({
            ...prev,
            [productId]: defaultImage,
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${SERVER_API_URL}/api/jewellery`,
                    {
                        params: {
                            sub_category: gender || undefined,
                            product_name: Item_Name || undefined
                        }
                    }
                );

                setAllProducts(response.data.data);

            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchData();
    }, [gender, Item_Name]);

    const getColorsForProduct = (same_color_type) => {
        // Filter products that match the same title
        const matchingProducts = allProducts.filter(p => p.same_color_type === same_color_type);

        // Extract frame and lens colors
        const colors = matchingProducts.map(p => ({
            productId: p.product_id,  // ✅ Include product ID
            color: p.color || "#FFFFFF", // Default White if null
        }));

        return colors;
    };

    // Run effect whenever wishlistItems updates
    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistItems(storedWishlist);
    }, []); // ✅ Add wishlistItems as dependency

    const toggleWishlist = (product) => {
        setWishlistItems((prevWishlist) => {
            let updatedWishlist = [...prevWishlist];
            const index = updatedWishlist.findIndex(item => item.product_id === product.product_id);

            if (index !== -1) {
                updatedWishlist.splice(index, 1); // Remove if exists
            } else {
                updatedWishlist.push(product); // Add if not exists
            }

            localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
            updateCounts(); // Update count globally
            return updatedWishlist;
        });
        // ✅ Use window.location.reload() to bypass ESLint restriction
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    console.log("first1", allProducts)

    return (
        <>
            <Header />
            <div className="product-page">
                <div className="banner" />

                <div className='product-header'>
                    <div className="filter-bar">
                        <span className="active">
                            View Frames:-
                            {/* View Frames:- {[...selectedFrameType, ...selectedFrameShape].join(" / ")} */}
                        </span>

                        <div className="sort">
                            <LuArrowDownUp style={{ color: "#009688", fontSize: "14px" }} />
                            <span className='active' style={{ fontSize: "13px" }}>SORT BY:</span>
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                <option>Price: All item</option>
                                <option>Price: High to Low</option>
                                <option>Price: Low to High</option>
                                <option>Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">

                    {/* Product Grid Section */}
                    <div className="product-grid" style={{ width: "100%" }}>
                        {allProducts?.map((product, index) => {
                            const defaultImage = product.thumbnail_url;
                            const hoverImage = product.images?.[2] || defaultImage;
                            const imageSrc = hoveredImages[product.product_id] || defaultImage;

                            return (
                                <div key={index} className="product-card" style={{ maxWidth: "335px" }}>
                                    <div className="red-heart-container">
                                        {wishlistItems.some(item => item.product_id === product.product_id) ? (
                                            // <BsBagHeartFill className='hert-icon red-background' onClick={() => toggleWishlist(product)} />
                                            <img src={wishlist} alt="wishlist" className='wishlist-image' onClick={() => toggleWishlist(product)} />
                                        ) : (
                                            // <BsBagHeart className='hert-icon' onClick={() => toggleWishlist(product)} />
                                            <img src={wishlist1} alt="wishlist" className='wishlist-image' onClick={() => toggleWishlist(product)} />
                                        )}
                                    </div>
                                    <Link to={`/product-item/${product.main_category}/${product.product_id}`}>
                                        <img
                                            className="carousel-image2"
                                            src={`${SERVER_API_URL}/${imageSrc}`}
                                            alt={`ImageItem ${product.product_id}`}
                                            onMouseEnter={() => handleMouseEnter(product.product_id, hoverImage)}
                                            onMouseLeave={() => handleMouseLeave(product.product_id, defaultImage)}
                                        />
                                    </Link>
                                    <div className="product-info">
                                        {product.count_in_stock === 0 ? (
                                            <h4 className='out-of-stock'>Out of stock</h4>
                                        ) : (
                                            <h4 className='out-of-stock' style={{ color: "green" }}>In stock</h4>
                                        )}
                                        <h4 className="product-hilight">{product.product_name}</h4>
                                        <strong className="product-title font-styleing" >{product.description.slice(0, 50)}..</strong>
                                        <div className="product-discount">
                                            <p className="discount-title">₹{product.price}</p>
                                            <span className="discount-off">({product.discount_percent}% OFF)<span className='out-of-stock' style={{ color: "#e8a617", textTransform: "uppercase", fontSize: "9px" }}>For {product.gender}</span></span>
                                        </div>
                                        <p className="product-price1">
                                            ₹{(product.price - (product.price * product.discount_percent / 100)).toFixed(0)}/-
                                        </p>

                                        <div className="button-add-to-cart">
                                            <div className="product-attributes">
                                                <p className="product-attribute">
                                                    <strong>Colors:</strong>
                                                    <div className="color-options">
                                                        {getColorsForProduct(product.same_color_type).length > 0 ? (
                                                            getColorsForProduct(product.same_color_type).map((colorObj) => (
                                                                <Link to={`/product-item/${colorObj.productId}`}>
                                                                    <span
                                                                        key={colorObj.productId}  // ✅ Using Product ID as key
                                                                        className="color-box"
                                                                        title={`Frame: ${colorObj.color}, Lens: ${colorObj.color}`}
                                                                        style={{
                                                                            background: `linear-gradient(to top, ${colorObj.color} 50%, ${colorObj.color} 50%)`,
                                                                            display: 'inline-block',
                                                                            width: '30px',
                                                                            height: '30px',
                                                                            borderRadius: '15px',
                                                                            margin: '0 5px',
                                                                            border: '1px solid #ddd',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    ></span>
                                                                </Link>
                                                            ))
                                                        ) : (
                                                            <span>No Colors Available</span>
                                                        )}
                                                    </div>
                                                </p>
                                                <p className="product-attribute">
                                                    <strong>Material_Type:</strong> {product.material_type}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Pagination Section */}
                {/* <div className='pagination-main-container'>
                    <div className="pagination">
                        <button className="prev-btn">
                            Prev
                        </button>
                        <button className="next-btn">
                            Next
                        </button>
                    </div>
                </div> */}
            </div>
        </>
    );
};
export default Jewellery;