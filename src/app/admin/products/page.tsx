"use client";

/**
 * Admin Products Management
 *
 * Manage the shop inventory: toys and medication.
 * Images are uploaded to Supabase Storage (product-images bucket).
 * Discount price is optional — if set, the "Sale" badge appears on the card.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "../pets/PetsManagement.module.css"; // Re-use admin table styles

const EMPTY_FORM = {
  name: "", category: "toy", sub_category: "", target_pet: "all", price: "", discount_percentage: "",
  description: "", manufacturer: "", photo_urls: [] as string[],
  medication_form: "", toy_material: "", health_benefit: "",
  badge_text: "", rating: "5.0", review_count: "0",
  stock_count: "1", is_sold_out: false
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkData, setBulkData] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => { 
    fetchProducts(); 
    fetchOptions();
  }, []);

  async function fetchOptions() {
    const { data } = await supabase.from("filter_options").select("*");
    if (data) setOptions(data);
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.price || isNaN(Number(formData.price))) newErrors.price = "Enter a valid price.";
    if (formData.discount_percentage && isNaN(Number(formData.discount_percentage))) newErrors.discount_percentage = "Enter a valid percentage.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    
    let discountPriceVal = null;
    let discountPercVal = null;
    if (formData.discount_percentage) {
      discountPercVal = parseFloat(formData.discount_percentage);
      if (!isNaN(discountPercVal) && discountPercVal > 0 && discountPercVal <= 100) {
         discountPriceVal = parseFloat(formData.price) * (1 - discountPercVal / 100);
      }
    }

    const productData = {
      name: formData.name.trim(),
      category: formData.category,
      sub_category: formData.sub_category,
      target_pet: formData.target_pet,
      price: parseFloat(formData.price),
      discount_price: discountPriceVal,
      discount_percentage: discountPercVal,
      description: formData.description.trim(),
      manufacturer: formData.manufacturer.trim(),
      photo_urls: formData.photo_urls || [],
      photo_url: formData.photo_urls?.[0] || null, // Primary photo for cards
      medication_form: formData.medication_form || null,
      toy_material: formData.toy_material || null,
      health_benefit: formData.health_benefit || null,
      badge_text: formData.badge_text.trim() || null,
      rating: parseFloat(formData.rating) || 5.0,
      review_count: parseInt(formData.review_count, 10) || 0,
      stock_count: parseInt(formData.stock_count, 10) || 0,
      is_sold_out: formData.is_sold_out,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("products").update(productData).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("products").insert([{ ...productData, is_active: true }]);
      error = res.error;
    }

    if (error) {
      setErrors({ form: "Failed to save product." });
      console.error("[Admin Products] Save error:", error.message);
    } else {
      setIsAdding(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setErrors({});
      fetchProducts();
    }
    setSaving(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      ...EMPTY_FORM,
      ...product,
      photo_urls: product.photo_urls || (product.photo_url ? [product.photo_url] : []),
      price: product.price?.toString() || "",
      discount_percentage: product.discount_percentage?.toString() || "",
      rating: product.rating?.toString() || "5.0",
      review_count: product.review_count?.toString() || "0",
      stock_count: product.stock_count?.toString() || "1",
    });
    setEditingId(product.id);
    setIsAdding(true);
    setIsBulk(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) return;
    setSaving(true);
    const lines = bulkData.trim().split("\n");
    const newProducts = lines.map(line => {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length < 3) return null;
      const [name, category, price, description] = parts;
      return {
        name,
        category,
        price: parseFloat(price),
        description: description || "",
        is_active: true,
        target_pet: "all"
      };
    }).filter(p => p !== null);

    if (newProducts.length === 0) {
       setErrors({ bulk: "No valid products found. Use: Name, Category, Price, Description" });
       setSaving(false);
       return;
    }

    const { error } = await supabase.from("products").insert(newProducts);
    if (error) {
      setErrors({ bulk: "Failed to import products: " + error.message });
    } else {
      setIsBulk(false);
      setBulkData("");
      fetchProducts();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !current }).eq("id", id);
    if (error) alert("Failed to update status: " + error.message);
    fetchProducts();
  };

  const toggleSoldOut = async (id: string, current: boolean) => {
    const { error } = await supabase.from("products").update({ is_sold_out: !current }).eq("id", id);
    if (error) alert("Failed to update stock: " + error.message);
    fetchProducts();
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Failed to delete product: " + error.message);
    fetchProducts();
  };

  const f = (k: string, v: any) => setFormData({ ...formData, [k]: v });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Shop Inventory</h1>
        <div className={styles.headerActions}>
           <button className={styles.bulkToggleBtn} onClick={() => { setIsBulk(!isBulk); setIsAdding(false); }}>
             {isBulk ? "Cancel" : "Bulk Upload"}
           </button>
           <button className={styles.addBtn} onClick={() => { 
             setIsAdding(!isAdding); 
             setIsBulk(false); 
             if (isAdding) { setEditingId(null); setFormData(EMPTY_FORM); }
           }}>
             {isAdding ? "Cancel" : "+ Add Product"}
           </button>
        </div>
      </div>

      {isBulk && (
        <div className={`${styles.bulkSection} glass`}>
          <h2>Bulk Inventory Import</h2>
          <p>Enter products as: <code>Name, Category, Price, Description</code> (One per line)</p>
          <textarea 
            className={styles.bulkArea} 
            value={bulkData} 
            onChange={(e) => setBulkData(e.target.value)} 
            placeholder="e.g. Rubber Duck, toy, 5.99, A squeaky toy"
            rows={10}
          />
          {errors.bulk && <span className={styles.error}>{errors.bulk}</span>}
          <button className={styles.saveBtn} onClick={handleBulkUpload} disabled={saving}>
            {saving ? "Importing..." : "Run Bulk Import"}
          </button>
        </div>
      )}

      {isAdding && (
        <form className={`${styles.form} glass`} onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Product" : "New Product"}</h2>

          <div className={styles.imageGrid}>
            <label>Product Gallery (Max 5 Photos)</label>
            <div className={styles.uploadRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <ImageUpload 
                  key={i}
                  bucket="product-images" 
                  label={i === 0 ? "Main Photo" : `Photo ${i+1}`}
                  onUpload={(url) => {
                    const newUrls = [...(formData.photo_urls || [])];
                    newUrls[i] = url;
                    f("photo_urls", newUrls);
                  }} 
                />
              ))}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Product Name *</label>
              <input type="text" value={formData.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Tough Squeaker Bone" />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label>Category *</label>
              <select value={formData.category} onChange={(e) => f("category", e.target.value)}>
                <option value="">Select Category</option>
                {options.filter(o => o.group_key === "product_category").map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Sub-Category / Type</label>
              <select value={formData.sub_category} onChange={(e) => f("sub_category", e.target.value)}>
                <option value="">None</option>
                {options.filter(o => {
                  if (formData.category === "medication") return o.group_key === "medication_type";
                  if (formData.category === "toy") return o.group_key === "toy_type";
                  return false;
                }).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Target Pet</label>
              <select value={formData.target_pet} onChange={(e) => f("target_pet", e.target.value)}>
                <option value="all">For All Pets</option>
                <option value="dog">For Dogs</option>
                <option value="cat">For Cats</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Price (NGN base) *</label>
              <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => f("price", e.target.value)} placeholder="0.00" />
              {errors.price && <span className={styles.error}>{errors.price}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label>Discount Percentage (%)</label>
              <input type="number" step="1" min="0" max="100" value={formData.discount_percentage} onChange={(e) => f("discount_percentage", e.target.value)} placeholder="Leave blank for no discount" />
              {formData.price && formData.discount_percentage && !isNaN(Number(formData.price)) && !isNaN(Number(formData.discount_percentage)) && (
                <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, marginTop: '6px', display: 'block' }}>
                  Sale Price Preview: {formatPrice(Number(formData.price) * (1 - Number(formData.discount_percentage) / 100))}
                </span>
              )}
              {errors.discount_percentage && <span className={styles.error}>{errors.discount_percentage}</span>}
            </div>
            
            <div className={styles.inputGroup}>
              <label>Promo Badge Text</label>
              <input type="text" value={formData.badge_text} onChange={(e) => f("badge_text", e.target.value)} placeholder="e.g. 🔄 Easy Repeat" />
            </div>
            <div className={styles.inputGroup}>
              <label>Average Rating (1.0 - 5.0)</label>
              <input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => f("rating", e.target.value)} />
            </div>
            <div className={styles.inputGroup}>
              <label>Review Count</label>
              <input type="number" min="0" value={formData.review_count} onChange={(e) => f("review_count", e.target.value)} />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Stock Count</label>
              <input type="number" min="0" value={formData.stock_count} onChange={(e) => f("stock_count", e.target.value)} />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Status</label>
              <select value={formData.is_sold_out ? "true" : "false"} onChange={(e) => f("is_sold_out", e.target.value === "true")}>
                <option value="false">In Stock</option>
                <option value="true">Sold Out</option>
              </select>
            </div>

            {(formData.category === "toy" || formData.category === "medication") && (
              <div className={styles.inputGroup}>
                <label>Manufacturer / Brand</label>
                <select value={formData.manufacturer} onChange={(e) => f("manufacturer", e.target.value)}>
                  <option value="">Select Brand</option>
                  {options.filter(o => o.group_key === "product_manufacturer" && (o.parent_value === formData.category || !o.parent_value)).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.category === "medication" && (
              <>
                <div className={styles.inputGroup}>
                  <label>Medicine Form</label>
                  <select value={formData.medication_form} onChange={(e) => f("medication_form", e.target.value)}>
                    <option value="">None</option>
                    {options.filter(o => o.group_key === "medication_form").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Health Benefit</label>
                  <select value={formData.health_benefit} onChange={(e) => f("health_benefit", e.target.value)}>
                    <option value="">None</option>
                    {options.filter(o => o.group_key === "health_benefit").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </>
            )}

            {formData.category === "toy" && (
              <div className={styles.inputGroup}>
                <label>Toy Material</label>
                <select value={formData.toy_material} onChange={(e) => f("toy_material", e.target.value)}>
                  <option value="">None</option>
                  {options.filter(o => o.group_key === "toy_material").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea value={formData.description} onChange={(e) => f("description", e.target.value)} placeholder="What makes this product special?" rows={3} />
          </div>

          {errors.form && <div className={styles.formError}>{errors.form}</div>}
          <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : (editingId ? "Update Product" : "Save Product")}</button>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.photo_url ? <img src={p.photo_url} alt={p.name} className={styles.thumb} /> : <span className={styles.noPhoto}>🛍</span>}</td>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>{formatPrice(p.price)} {p.discount_percentage ? `(-${p.discount_percentage}%)` : ''}</td>
                <td>{p.stock_count} Units</td>
                <td>
                  <span className={p.is_sold_out ? styles.statusAdopted : (p.is_active ? styles.statusAvailable : styles.statusAdopted)}>
                    {p.is_sold_out ? "Sold Out" : (p.is_active ? "Active" : "Hidden")}
                  </span>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button className={styles.toggleBtn} onClick={() => handleEdit(p)}>
                      Edit
                    </button>
                    <button className={styles.toggleBtn} onClick={() => toggleSoldOut(p.id, p.is_sold_out)}>
                      {p.is_sold_out ? "Mark in Stock" : "Mark Sold Out"}
                    </button>
                    <button className={styles.toggleBtn} onClick={() => toggleActive(p.id, p.is_active)}>
                      {p.is_active ? "Hide" : "Show"}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => deleteProduct(p.id, p.name)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
