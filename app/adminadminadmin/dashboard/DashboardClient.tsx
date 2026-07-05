"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { Boxes, ImagePlus, LayoutDashboard, LogOut, PackagePlus, Save, Tags, Trash2 } from "lucide-react";
import {
  createCategory,
  createHomepageSection,
  createProduct,
  deleteCategory,
  deleteHomepageSection,
  deleteProduct,
  logoutAdmin,
  saveSiteSettings
} from "@/app/actions";
import type { ActionResult, fetchAllData } from "@/app/actions";

type DashboardData = Awaited<ReturnType<typeof fetchAllData>>;

const initialState: ActionResult = {};

function Alert({ state }: { state: ActionResult }) {
  if (state.error) return <div className="dashboard-alert error">{state.error}</div>;
  if (state.ok && state.message) return <div className="dashboard-alert success">{state.message}</div>;
  return null;
}

function SubmitButton({ pending, label, pendingLabel, icon }: { pending: boolean; label: string; pendingLabel: string; icon: ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="dashboard-button">
      {icon}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const { settings, categories, sections, products } = data;
  const [settingsState, settingsAction, settingsPending] = useActionState(saveSiteSettings, initialState);
  const [categoryState, categoryAction, categoryPending] = useActionState(createCategory, initialState);
  const [sectionState, sectionAction, sectionPending] = useActionState(createHomepageSection, initialState);
  const [productState, productAction, productPending] = useActionState(createProduct, initialState);
  const [deleteCategoryState, deleteCategoryAction, deleteCategoryPending] = useActionState(deleteCategory, initialState);
  const [deleteSectionState, deleteSectionAction, deleteSectionPending] = useActionState(deleteHomepageSection, initialState);
  const [deleteProductState, deleteProductAction, deleteProductPending] = useActionState(deleteProduct, initialState);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p>Commerce CMS</p>
          <h1>Admin Dashboard</h1>
        </div>
        <form action={logoutAdmin}>
          <button className="ghost-button" type="submit"><LogOut size={17} /> Sign out</button>
        </form>
      </header>

      <section className="dashboard-overview" aria-label="Content summary">
        <div><Tags size={19} /><span>{categories.length}</span><p>Categories</p></div>
        <div><LayoutDashboard size={19} /><span>{sections.length}</span><p>Sections</p></div>
        <div><Boxes size={19} /><span>{products.length}</span><p>Products</p></div>
      </section>

      <section className="dashboard-grid">
        <form action={settingsAction} className="dashboard-panel settings-panel">
          <div className="panel-heading">
            <div><Save size={18} /><h2>Site Settings</h2></div>
            <Alert state={settingsState} />
          </div>
          <label>Logo text<input name="logoText" defaultValue={settings.logoText} /></label>
          <label>Logo image URL<input name="logoUrl" defaultValue={settings.logoUrl} /></label>
          <label>Footer text<textarea name="footerText" defaultValue={settings.footerText} rows={4} /></label>
          <SubmitButton pending={settingsPending} pendingLabel="Saving..." label="Save settings" icon={<Save size={17} />} />
        </form>

        <form action={categoryAction} className="dashboard-panel">
          <div className="panel-heading">
            <div><Tags size={18} /><h2>Add Category</h2></div>
            <Alert state={categoryState} />
          </div>
          <label>Name<input name="name" required /></label>
          <label>Slug<input name="slug" required /></label>
          <label>Sort order<input name="sortOrder" type="number" defaultValue="0" /></label>
          <label className="dashboard-check"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
          <SubmitButton pending={categoryPending} pendingLabel="Creating..." label="Create category" icon={<Tags size={17} />} />
        </form>

        <form action={sectionAction} className="dashboard-panel wide-panel">
          <div className="panel-heading">
            <div><ImagePlus size={18} /><h2>Add Homepage Section</h2></div>
            <Alert state={sectionState} />
          </div>
          <div className="dashboard-fields">
            <label>Title<input name="title" required /></label>
            <label>Subtitle<input name="subtitle" /></label>
            <label>Image URL<input name="imageUrl" /></label>
            <label>CTA label<input name="ctaLabel" defaultValue="Shop now" /></label>
            <label>CTA href<input name="ctaHref" defaultValue="/#products" /></label>
            <label>Sort order<input name="sortOrder" type="number" defaultValue="0" /></label>
          </div>
          <label>Body<textarea name="body" rows={4} /></label>
          <label className="dashboard-check"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
          <SubmitButton pending={sectionPending} pendingLabel="Creating..." label="Create section" icon={<ImagePlus size={17} />} />
        </form>

        <form action={productAction} className="dashboard-panel wide-panel">
          <div className="panel-heading">
            <div><PackagePlus size={18} /><h2>Add Product</h2></div>
            <Alert state={productState} />
          </div>
          <div className="dashboard-fields">
            <label>Name<input name="name" required /></label>
            <label>Slug<input name="slug" required /></label>
            <label>Image URL<input name="imageUrl" /></label>
            <label>Price<input name="price" type="number" min="0" step="0.01" required /></label>
            <label>Stock<input name="stock" type="number" defaultValue="0" /></label>
            <label>Sort order<input name="sortOrder" type="number" defaultValue="0" /></label>
            <label>Category<select name="categoryId"><option value="">General</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          </div>
          <label>Description<textarea name="description" rows={4} /></label>
          <label className="dashboard-check"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
          <SubmitButton pending={productPending} pendingLabel="Creating..." label="Create product" icon={<PackagePlus size={17} />} />
        </form>
      </section>

      <section className="dashboard-lists">
        <div className="dashboard-panel">
          <div className="panel-heading"><div><Tags size={18} /><h2>Categories</h2></div><Alert state={deleteCategoryState} /></div>
          {categories.length ? categories.map((item) => (
            <form className="dashboard-row" action={deleteCategoryAction} key={item.id}>
              <span>{item.sortOrder}. {item.name}</span>
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" disabled={deleteCategoryPending} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button>
            </form>
          )) : <p className="empty-copy">No categories yet.</p>}
        </div>
        <div className="dashboard-panel">
          <div className="panel-heading"><div><LayoutDashboard size={18} /><h2>Homepage Sections</h2></div><Alert state={deleteSectionState} /></div>
          {sections.length ? sections.map((item) => (
            <form className="dashboard-row" action={deleteSectionAction} key={item.id}>
              <span>{item.sortOrder}. {item.title}</span>
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" disabled={deleteSectionPending} aria-label={`Delete ${item.title}`}><Trash2 size={16} /></button>
            </form>
          )) : <p className="empty-copy">No homepage sections yet.</p>}
        </div>
        <div className="dashboard-panel">
          <div className="panel-heading"><div><Boxes size={18} /><h2>Products</h2></div><Alert state={deleteProductState} /></div>
          {products.length ? products.map((item) => (
            <form className="dashboard-row" action={deleteProductAction} key={item.id}>
              <span>{item.name} &middot; ${Number(item.price).toFixed(2)}</span>
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" disabled={deleteProductPending} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button>
            </form>
          )) : <p className="empty-copy">No products yet.</p>}
        </div>
      </section>
    </main>
  );
}
