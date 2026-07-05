import Link from "next/link";
import { AddToCartButton } from "./components/AddToCartButton";
import { getStorefrontData } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, categories, sections, products } = await getStorefrontData();
  const hero = sections[0];
  const supporting = sections;

  return (
    <main>
    
      <header className="site-header">
        <Link href="/" className="brand">
          {settings.logoUrl ? <img src={settings.logoUrl} alt="" /> : null}
          <span>{settings.logoText}</span>
        </Link>
        <nav>
          <a href="#categories">Categories</a>
          <a href="#products">Products</a>
      
        
        </nav>
      </header>

      <section className="hero" style={{ backgroundImage: hero?.imageUrl ? `linear-gradient(90deg, rgba(30,34,28,.82), rgba(30,34,28,.28)), url(${hero.imageUrl})` : undefined }}>
        <div>
          <p>{hero?.subtitle || "Guest checkout, no customer accounts"}</p>
          <h1>{hero?.title || "Dynamic commerce managed from one admin dashboard"}</h1>
          <span>{hero?.body || "Products, sections, footer, logo, and categories come from the CMS database."}</span>
          <a className="hero-cta" href={hero?.ctaHref || "#products"}>{hero?.ctaLabel || "Shop products"}</a>
        </div>
      </section>

      <section id="categories" className="band">
        <div className="section-heading">
          <p>Browse by department</p>
          <h2>Categories managed in the CMS</h2>
        </div>
        <div className="category-strip">
          {categories.map((category) => <a href="#products" key={category.id}>{category.name}</a>)}
        </div>
      </section>

      {supporting.map((section) => (
        <section className="story-band" key={section.id}>
          <img src={section.imageUrl} alt="" />
          <div>
            <p>{section.subtitle}</p>
            <h2>{section.title}</h2>
            <span>{section.body}</span>
            <a href={section.ctaHref}>{section.ctaLabel}</a>
          </div>
        </section>
      ))}

      <section id="products" className="band products-band">
        <div className="section-heading">
          <p>Guest shopping</p>
          <h2>Add products to cart without signing in</h2>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <img src={product.imageUrl} alt="" />
              <div>
                <p>{categories.find((category) => category.id === product.categoryId)?.name || "General"}</p>
                <h3>{product.name}</h3>
                <span>{product.description}</span>
                <footer>
                  <strong>${Number(product.price).toFixed(2)}</strong>
                  <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl }} />
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>
<footer className="site-footer">{settings.footerText}</footer>


    </main>
  );
}
