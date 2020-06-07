import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController{
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const insertedId = await trx('points').insert(point);

        const point_items = items.split(',').map((x: string) => Number(x.trim())).map((x: number) => {
            return {
                item_id: x,
                point_id: insertedId[0]
            };
        });

        await trx('point_items').insert(point_items);

        await trx.commit();

        return response.json({ 
            id: insertedId[0],
            ...point
        });
    }

    async show(request: Request, response: Response){
        const { id } = request.params;
        console.log(id);

        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: 'Point not found.' });
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.id')
            .where('point_items.point_id', 'id')
            .select('items.title');

        const serializedPoint = items.map(x => {
            return {
                ...x,
                image_url: `http://192.168.1.101:3333/uploads/${x.image}`
            };
        });

        return response.json({ point: serializedPoint, items });
    }

    async index(request: Request, response: Response){
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(x => Number(x.trim()));

        const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');

        const serializedPoints = points.map(x => {
            return {
                ...x,
                image_url: `http://192.168.1.101:3333/uploads/${x.image}`
            };
        });

        return response.json(serializedPoints);
    }
}

export default PointsController;