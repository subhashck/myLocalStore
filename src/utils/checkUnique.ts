import { TUnit } from "./types"

export const checkUnitsUnique = (units: TUnit[]) => {
    const uniqMap = new Map<string, number>() 
    let message:number[] = []
    units.forEach((unit,idx) => {    
        //get value of index name
        
        let firstInstance = uniqMap.get(unit.unitName)
        if (firstInstance !== undefined)
        {
            // console.log(productunit.unitname + ' is repeated at position: ' + firstInstance + ' & ' + idx)
            message = [firstInstance,idx]
        }
        uniqMap.set(unit.unitName,idx)
    })
    if(message.length>0){
        return message
    } 
    return null
}