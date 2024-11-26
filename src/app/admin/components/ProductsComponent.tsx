import AddItemForm from "./AddItemForm";
import ItemsTable from "./ItemsTable";
export default function ProductsComponent() {
    return (
        <div className="mx-5 my-5 border-2">
            <AddItemForm />
            <ItemsTable />
        </div>
    );
}