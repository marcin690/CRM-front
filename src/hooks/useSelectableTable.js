import {useState} from "react";

const useSelectableTable = (items = []) => {

    const [selectedItems, setSelectedItems]= useState([])

    const handleSelectItem = (id) => {
        setSelectedItems(prevSelected => {
            if (prevSelected.includes(id)){
                return prevSelected.filter(selectedId => selectedId !== id)
            } else {
                return [...prevSelected, id]
            }
        })
    }

    const handleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.id))
        }
    }

    const clearSelection = () => setSelectedItems([])

    return {
        selectedItems,
        handleSelectItem,
        handleSelectAll,
        clearSelection,
        allSelected: selectedItems.length === items.length,

    }

}

export default useSelectableTable