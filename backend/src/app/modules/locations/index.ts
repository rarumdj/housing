import { Router } from 'express';
import { Country, State } from 'country-state-city';
import naija from 'naija-state-local-government';
import handler from '../../utils/handler';
import { sendSuccess } from '../../utils/response';
import AppError from '../../utils/appError';
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

const listNigeriaStates = async (_req: Request, res: Response) => {
  const data = naija.states().sort((a, b) => a.localeCompare(b));
  return sendSuccess(res, { data });
};

const listNigeriaLgas = async (req: Request, res: Response) => {
  const state = String(req.params.state || '').trim();
  if (!state) {
    throw new AppError('State is required', 400);
  }

  try {
    const result = naija.lgas(state);
    const lgas = (result?.lgas ?? []).slice().sort((a, b) => a.localeCompare(b));
    return sendSuccess(res, { data: lgas });
  } catch {
    // Unknown state name — return an empty list so the UI can fall back to free entry.
    return sendSuccess(res, { data: [] });
  }
};

router.get('/countries', handler(listCountries));
router.get('/countries/:iso/states', handler(listStates));
router.get('/ng/states', handler(listNigeriaStates));
router.get('/ng/states/:state/lgas', handler(listNigeriaLgas));

export default router;
