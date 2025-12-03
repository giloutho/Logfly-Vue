import turfCenter from '@turf/center'
import * as turfHelper from '@turf/helpers'
import turfIntersect from '@turf/boolean-intersects'
import turfWithin from '@turf/points-within-polygon'
const METER_PER_FEET = 0.3048

export async function displayOpenAip(args) {
    const filter = args.filter;
    const filterValues = args.values
    const feature = args.feature;
    const result = await downloadAirspaces(filterValues, feature)
    if (result.success) {   
        const processed = await processDecoding(result.airspaces,filter,filterValues)
        return processed
    } else {
        return result
    }
}

async function downloadAirspaces(filterValues, feature) {
    const openAipKey = import.meta.env.VITE_OPENAIP_KEY;
    let openAip_Url
    const airspaces = []
    let delayMs = 10
    let page = 1
    let totalPages = 1
    if (filterValues.radius == 0) {
        const bbox = feature.properties.bbox
        // Pour une vérification on ne prends pas la classe E qui est un cas vraiment particulier 
        // si on la garde on sort de fausses violations
        // par exmemple  LTA FRANCE 3 ALPES 7 ARAVIS est classée E à partir de 3000 pieds
        // bien qu'elle soit de type 'CTA' c'est une LTA donc autorisée sans radio
        const icaoFilter = filterValues.classes   
        openAip_Url = `https://api.core.openaip.net/api/airspaces?page=${page}&limit=1000&bbox=${bbox}&icaoClass=${icaoFilter}&apiKey=${openAipKey}`
    } else {
        const geoCenter = turfCenter(feature)
        const center = geoCenter.geometry.coordinates[1]+','+geoCenter.geometry.coordinates[0]
        const distance = filterValues.radius
        const icaoFilter = filterValues.classes     // [0,1,2,3,4]   // F = 5   G = 6
        openAip_Url = `https://api.core.openaip.net/api/airspaces?page=${page}&limit=1000&pos=${center}&dist=${distance}&icaoClass=${icaoFilter}&apiKey=${openAipKey}`
    }
    try {
        while (page <= totalPages) {
            const response = await fetch(openAip_Url);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            if (response.ok) {
                const info = await response.json();
                totalPages = info.totalPages;
                airspaces.push(...info.items);
                page++;
                delayMs = 10;
            } else {
                delayMs *= 2;
                console.error(`HTTP status ${response.status}`);
            }
        }
        return { success: true, airspaces };
    } catch (e) {
        return { success: false, message: 'Error when downloading openAIP airspaces ' + e.message };
    }
}

async function processDecoding(openAipArray,filter,filterValues) {
    try {
        const promiseArray = []
        for (const item of openAipArray) {
            promiseArray.push(processItem(item))
        }
        const result = await Promise.all(promiseArray)
        let finalResult
        if (filter) {
            finalResult = result.filter((item) => filterAip(item,filterValues.types))
        } else {
            finalResult = [...result]
        }
        let totalGeoJson =[]
        for (let i = 0; i < finalResult.length; i++) {
            const el = finalResult[i]
            if (el.floorM < filterValues.floor) {
                // les coordonnées sont un double tableau...
                // je ne sais pas pourquoi mais si on fait simple tableau -> erreur
                let arrCoord = []
                arrCoord.push(el.polygon)
                // Problème des parcs comme celui des Bauges
                // le fait que ce soit une hauteur sol n'est pas clairement défini
                // Floor -> 0m Ceiling 300m donc chaque point sera forcément valide
                // Par déduction on a supposé que quand réferenceDatum était Gnd pour Floor et Ceiling
                // il s'agissait d'une hauteur sol mais rien en permet de vraiment valider
                let AltLimitTopAGL 
                if (el.floorRefGnd == 'Gnd' && el.topRefGnd == 'Gnd') {        
                    AltLimitTopAGL = true
                } else {
                    AltLimitTopAGL = false
                }
                let aipGeojson = {
                    type :"Feature",
                    properties : {
                        type : el.type,
                        Class : el.icaoClass,
                        Name : el.name,
                        id : el.id,
                        Comment : "",
                        Floor : el.floorM,
                        FloorLabel : el.floorLabel+' '+el.floorRefGnd,
                        Ceiling : el.topM,
                        CeilingLabel : el.topLabel+' '+el.topRefGnd,   
                        AltLimit_Top_AGL :  AltLimitTopAGL,             
                        AltLimit_Bottom_AGL : false, 
                        Color : getColor(el)       
                    },
                    geometry : {
                        type : "Polygon",
                        coordinates : arrCoord
                    } 
                }
                totalGeoJson.push(aipGeojson)
            }
        }    
        return { success: true, geojson: totalGeoJson };
    } catch (e) {
        return { success: false, message: 'Error during airspaces decoding: ' + e.message };
    }
}