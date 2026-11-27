import ProductTable from "../components/ProductTable";
import sampleProducts from "../data/sample";


export default function ProductPage() {
  return (
    <div>
        <header>OfficeMart Admin</header>
        <main>
            <div>
                <h1>Sản phẩm</h1>
            </div>
            <div>
                <button data-testid="add-button">Thêm sản phẩm</button>
            </div> 
        </main>
        <ProductTable products={sampleProducts}></ProductTable>
    </div>
  );
}
