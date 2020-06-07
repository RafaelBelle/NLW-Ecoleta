import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController{
    async index(request: Request, response: Response) {
        const items = await knex('items').select('*');
    
        const serializedItems = items.map(x => {
            return {
                id: x.id,
                title: x.title,
                image_url: `http://192.168.1.101:3333/uploads/${x.image}`
            };
        });
    
        return response.json(serializedItems);
    }
}

export default ItemsController;