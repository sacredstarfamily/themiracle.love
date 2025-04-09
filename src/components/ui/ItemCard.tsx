import { deleteItem } from "@/actions/adminActions";
import { Item } from "@/app/admin/components/ItemsTable";
import Image from "next/image";

export function ItemCard(props: { item: Item }) {
    const removeItem = async (id: string) => {
        await deleteItem(id);

    }
    return (
        <div className="justify-center items-center content-center" key={props.item.id}>
            <div className=" justify-center self-center overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md items-center" key={props.item.id}>
                <a className="relative mx-3 mt-3 flex p-2 bg-slate-200 overflow-hidden rounded-xl" href="#">
                    <Image className="rounded-t-lg" src={props.item.img_url} alt={props.item.name} width={150} height={150} />
                </a>
                <div className="items-center justify-center p-2">

                    <h5 className="mb-2 text-xl self-center text-center tracking-tight text-gray-900 ">{props.item.name}</h5>

                    <p className="mb-3 font-normal text-gray-700 ">
                        Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
                    </p>
                    <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Read more
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </a>
                    <button onClick={() => removeItem(props.item.id)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                        Delete  lkjlkj
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div></div>
    )
}