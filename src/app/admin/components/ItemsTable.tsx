import { getAllItems } from "@/actions/actions";
import { useEffect, useState } from "react";
import { deleteItem } from "@/actions/adminActions";
type Item = {
    id: string,
    name: string,
    price: number,
    quantity: number
}


export default function ItemsTable() {
    const [items, setItems] = useState<Item[]>();
    const fetchItems = async () => {
        const items = await getAllItems();
        setItems(items);
    }
    const removeItem = async (id: string) => {
        await deleteItem(id);
        return fetchItems();
    }
    useEffect(() => {
        fetchItems();
    }, [])
    return (
        <div>
            <ul>
                {items?.map((item) => (
                    <li className="flex flex-row flex-3 justify-center" key={item.id}>
                        <p className="p-2">{item.name}</p>
                        <p className="p-2">{item.price}</p>
                        <p className="p-2">{item.quantity}</p>
                        <button onClick={() => { removeItem(item.id) }}>Remove</button>
                    </li>))}
            </ul>
        </div>
    )
}