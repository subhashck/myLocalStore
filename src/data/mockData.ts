import { TCategoryList, TItems } from "@/utils/types";

export const categories: TCategoryList[] = [
    { id: 1, categoryName: "Cat" },
    { id: 2, categoryName: "Dog" },
    { id: 3, categoryName: "Elephant" },
    { id: 4, categoryName: "Lion" },
    { id: 5, categoryName: "Tiger" },
    { id: 6, categoryName: "Giraffe" },
    { id: 7, categoryName: "Dolphin" },
    { id: 8, categoryName: "Penguin" },
    { id: 9, categoryName: "Zebra" },
    { id: 10, categoryName: "Shark" },
    { id: 11, categoryName: "Whale" },
    { id: 12, categoryName: "Otter" },
    { id: 13, categoryName: "Crocodile" }
];

export const items: TItems[] = [
    {
        itemName: 'PaperBoat-Apple',
        forSale: false,
        forStock: false,
        category: 'Fruit Drinks',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 8,
            salePrice: 10
        },
        {
            unitName: 'Pack of 12',
            factor: 12,
            costPrice: 9,
            salePrice: 100
        }]
    },
    {
        itemName: 'Coca-Cola -100ml',
        forSale: true,
        forStock: true,
        category: 'Fruit Drinks',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 20
        }]
    },
    {
        itemName: 'Sprite-100ml',
        forSale: true,
        forStock: true,
        category: 'Fruit Drinks',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 10
        }]
    },
    {
        itemName: 'Crush',
        forSale: true,
        forStock: true,
        category: 'Smoke',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 10
        },
        {
            unitName: 'Box',
            factor: 20,
            costPrice: 0,
            salePrice: 100
        }]
    },
    {
        itemName: 'PaperBoat-Litchee',
        forSale: true,
        forStock: true,
        category: 'Fruit Drinks',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 10
        }]
    },
    {
        itemName: 'PaperBoat-Apple',
        forSale: true,
        forStock: true,
        category: 'Fruit Drinks',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 10
        }]
    },
    {
        itemName: 'PaperBoat-Mango',
        forSale: true,
        forStock: true,
        category: 'Fruit Drinks',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 10
        }]
    },
    {
        itemName: 'PaperBoat-Mixed Fruit',
        forSale: true,
        forStock: true,
        category: 'Fruit Drinks',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 10
        }]
    },
    {
        itemName: 'GoldFlake',
        forSale: true,
        forStock: true,
        category: 'Cigarretes',
        unit: [{
            unitName: 'pcs',
            factor: 1,
            costPrice: 0,
            salePrice: 10
        }]
    }
]