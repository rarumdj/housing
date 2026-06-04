import { Router } from 'express';
import { Country, State } from 'country-state-city';
import handler from '../../utils/handler';
import { sendSuccess } from '../../utils/response';
import type { Request, Response } from 'express';

const router = Router();

const listCountries = async (_req: Request, res: Response) => {
  const data = Country.getAllCountries().map((c) => ({
    name: c.name,
    iso: c.isoCode,
    phoneCode: c.phonecode,
    flag: c.flag,
  }));
  return sendSuccess(res, { data });
};

const listStates = async (req: Request, res: Response) => {
  const data = State.getStatesOfCountry(req.params.iso).map((s) => ({
    name: s.name,
    iso: s.isoCode,
  }));
  return sendSuccess(res, { data });
};

router.get('/countries', handler(listCountries));
router.get('/countries/:iso/states', handler(listStates));

export default router;
