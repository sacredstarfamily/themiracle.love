import { getAllItems } from "@/actions/actions";
import { ItemCard } from "@/components/ui/ItemCard";
import { useEffect, useState } from "react";

export type Item = {
    id: string,
    name: string,
    img_url: string,
    price: number,
    quantity: number
}


export default function ItemsTable() {

    const [items, setItems] = useState<Item[]>();


    useEffect(() => {
        const isDev = process.env.NODE_ENV === 'development';
        const setImageUrlDev = (item: Item) => {
            if (isDev) {
                item.img_url = item.img_url.slice(7)
            }
        }
        const fetchItems = async () => {
            const items = await getAllItems();
            items.forEach((item) => {
                setImageUrlDev(item);
            })
            setItems(items);
        }
        fetchItems();
    }, [])
    return (
        <div className="align-middle self-center place-content-center justify-between items-center content-center flex flex-wrap gap-4 p-5">

            {items?.map((item) => (
                /*                 <div className="flex flex-row flex-auto justify-center" key={item.id}>
                                    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700" key={item.id}>
                                        <a href="#">
                                            <Image className="rounded-t-lg" src={item.img_url} alt={item.name} width={100} height={100} />
                
                                        </a>
                                        <div className="p-5">
                                            <a href="#">
                                                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{item.name}</h5>
                                            </a>
                                            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
                                            <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                                Read more
                                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                                </svg>
                                            </a>
                                            <button onClick={() => removeItem(item.id)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                                            </button>
                                        </div>
                                    </div>
                                </div> */
                <ItemCard key={item.id} item={item} />
            )
            )
            }

        </div>
    )
}