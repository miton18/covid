import fetch from 'isomorphic-fetch'
import countries from './countries.mjs'

console.log('starting')
const wToken = process.env.WARP_TOKEN_WRITE
const gts = []
const m = new Map()

m.set('', {
    lat: 0,
    long: 0,
    alt: 0
})

countries.map(country => {
    m.set(country.name, {
        lat: country.latlng[0],
        long: country.latlng[1],
        alt: country.latlng[2] || 0
    })
})


fetch('https://pomber.github.io/covid19/timeseries.json')
.then(res => res.json())
.then(data => {
    Object.entries(data).map(([country, v]) => {
        if (country === 'North Macedonia') {
            country = 'Macedonia'
        } else if (country === 'US') {
            country = 'United States'
        } else if (country === 'Korea, South') {
            country = 'South Korea'
        } else if (country === 'Taiwan*') {
            country = 'Taiwan'
        } else if (country === 'Congo (Kinshasa)') {
            country = 'Republic of the Congo'
        } else if (country === 'Gambia, The') {
            country = 'Gambia'
        } else if (country === 'The Gambia') {
            country = 'Gambia'
        } else if (country === 'Bahamas, The') {
            country = 'Bahamas'
        } else if (country === 'The Bahamas') {
            country = 'Bahamas'
        }

        const latlng = m.get(country)
        if (latlng == undefined) {
            console.error('Unknow country', country)
            process.exit(0)
        }

        v.map(day => {
            const date = new Date(day.date)
            //console.log(country, day.date, day.confirmed, day.deaths, day.recovered)
            gts.push(`${date.getTime()}000/${latlng.lat}:${latlng.long}/${latlng.alt} people.count{country=${country},state=recovered} ${day.recovered}`)
            gts.push(`${date.getTime()}000/${latlng.lat}:${latlng.long}/${latlng.alt} people.count{country=${country},state=deaths} ${day.deaths}`)
            gts.push(`${date.getTime()}000/${latlng.lat}:${latlng.long}/${latlng.alt} people.count{country=${country},state=confirmed} ${day.confirmed}`)
        })

    })
})
.then(() => {
    console.log('ready to push')
    const sensision = gts.join('\n')

    return fetch(process.env.WARP_ENDPOINT, {
        method: 'POST',
        headers: {
            "Content-Type": "text/plain",
            "X-Warp10-Token": wToken
        },
        body: sensision
    })
})
.catch(err => console.error(err))