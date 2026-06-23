import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { products } from "@/data/products";

export async function GET() {
  try {
    // 1. Extract unique categories
    const categoryNames = Array.from(new Set(products.map(p => p.category)));
    
    // 2. Insert Categories
    const categoryIds: Record<string, string> = {};
    
    for (const name of categoryNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      
      const { data: existing, error: fetchErr } = await supabase.from("categories").select("*").eq("slug", slug).single();
      
      if (existing) {
        categoryIds[name] = existing.id;
      } else {
        const { data, error } = await supabase.from("categories").insert([{ name, slug }]).select().single();
        if (error) {
          console.error("Error inserting category:", error);
        } else if (data) {
          categoryIds[name] = data.id;
        }
      }
    }

    // 3. Insert Products
    let insertedCount = 0;
    for (const product of products) {
      const { data: existingProd } = await supabase.from("products").select("*").eq("slug", product.slug).single();
      
      if (!existingProd) {
        const dbProduct = {
          name: product.name,
          slug: product.slug,
          price: product.price,
          original_price: product.originalPrice || null,
          image: product.image,
          images: product.images || [],
          rating: product.rating,
          reviews: product.reviews,
          badge: product.badge || null,
          badge_type: product.badgeType || null,
          is_new: product.isNew || false,
          in_stock: product.inStock,
          category_id: categoryIds[product.category] || null,
          description: product.description,
          specs: product.specs || [],
          features: product.features || [],
          is_featured: product.isFeatured || false,
          is_best_seller: product.isBestSeller || false
        };

        const { error } = await supabase.from("products").insert([dbProduct]);
        if (error) {
          console.error("Error inserting product:", product.name, error);
        } else {
          insertedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Inserted ${categoryNames.length} categories and ${insertedCount} new products.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
