import { Router } from 'express';

import { List } from '~/document';
import relational from '~/relational';

const router = Router();

/**
 * @name list - get a list
 * @param {string} _id - get a item by ID
 * @param {string} text - search for text in list
 *
 * @example get a list - GET /__/list
 * @example get a item from ID in list - GET /__/list?_id=${_id}
 * @example search a text in list - GET /__/list?text=${text}
 */
router.get('/', async (req, res, next) => {
  try {
    const find = {};
    const { _id, text } = req.query;

    if (_id) find['_id'] = { _id };
    if (text) find['text'] = { $regex: text, $options: 'i' };

    const data = await List.find(find).exec();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * @name pagination
 * @param {number} page - current page number
 * @param {number} row - rows per page
 * @example get a list of paging - GET /__/list/pagination/${page}/${row}
 */
router.get('/pagination/:page/:row', async (req, res, next) => {
  try {
    const row = Number(req.params.row);
    const list = await List.find({}).exec();
    const data = [];

    for (let i = 0; i < list.length / row; i++) {
      if (Number(req.params.page) === (i + 1)) {
        data.push(List.find({}).skip(i * row).limit(row));
      }
    }

    res.json(await Promise.all(data));
  } catch (err) {
    next(err);
  }
});

/**
 * @name create - create a item
 * @example POST /__/list
 */
router.post('/', async (req, res, next) => {
  try {
    if (req.body.text) {
      const list = await new List(req.body);
      const message = await list.save().then(() => 'List saved');
      res.json({ message });
    } else {
      res.json({ message: 'Please pass text.' });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @name update - update a item
 * @example PUT /__/list/${id}
 */
router.put('/:id', async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id).exec();

    for (let prop in req.body) {
      if (req.body) list[prop] = req.body[prop];
    }

    const message = await list.save().then(() => 'List updated');
    res.json({ message });
  } catch (err) {
    next(err);
  }
});

/**
 * @name delete - remove a item
 * @example DELETE /__/list/${id}
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const message = await List.findByIdAndRemove(req.params.id).then(() => 'List deleted');
    res.json({ message });
  } catch (err) {
    next(err);
  }
});

/**
 * @name SQL
 */
router.get('/relational', async (req, res, next) => {
  try {
    const data = await relational.list.findAll();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
