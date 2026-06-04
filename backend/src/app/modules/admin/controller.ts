import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as AdminService from './service';

// ── Users ──

export const listUsers = async (req: Request, res: Response) => {
  const result = await AdminService.listUsers(req.query as Record<string, unknown>);
  return res.status(200).json({ success: true, error: false, ...result });
};

export const getUserDetail = async (req: Request, res: Response) => {
  const data = await AdminService.getUserDetail(req.params.id);
  return sendSuccess(res, { data });
};

export const verifyUser = async (req: Request, res: Response) => {
  const data = await AdminService.verifyUser(req.params.id, req.body.status, req.body.reason);
  return sendSuccess(res, { data, message: 'User verification updated' });
};

export const toggleUserActive = async (req: Request, res: Response) => {
  const data = await AdminService.toggleUserActive(req.params.id);
  return sendSuccess(res, { data, message: 'User status toggled' });
};

// ── Properties ──

export const listProperties = async (req: Request, res: Response) => {
  const result = await AdminService.listProperties(req.query as Record<string, unknown>);
  return res.status(200).json({ success: true, error: false, ...result });
};

export const verifyProperty = async (req: Request, res: Response) => {
  const data = await AdminService.verifyProperty(req.params.id, req.body.verificationStatus, req.body.reason);
  return sendSuccess(res, { data, message: 'Property verification updated' });
};

export const deleteProperty = async (req: Request, res: Response) => {
  await AdminService.deleteProperty(req.params.id);
  return sendSuccess(res, { message: 'Property archived' });
};

// ── Fees ──

export const listFees = async (_req: Request, res: Response) => {
  const data = await AdminService.listFees();
  return sendSuccess(res, { data });
};

export const createFee = async (req: Request, res: Response) => {
  const data = await AdminService.createFee(req.body);
  return sendSuccess(res, { statusCode: 201, data });
};

export const updateFee = async (req: Request, res: Response) => {
  const data = await AdminService.updateFee(req.params.id, req.body);
  return sendSuccess(res, { data });
};

export const deleteFee = async (req: Request, res: Response) => {
  await AdminService.deleteFee(req.params.id);
  return sendSuccess(res, { message: 'Fee deleted' });
};

// ── Analytics ──

export const overview = async (_req: Request, res: Response) => {
  const data = await AdminService.getOverview();
  return sendSuccess(res, { data });
};

export const revenue = async (_req: Request, res: Response) => {
  const data = await AdminService.getRevenueAnalytics();
  return sendSuccess(res, { data });
};

export const landlordAnalytics = async (_req: Request, res: Response) => {
  const data = await AdminService.getLandlordAnalytics();
  return sendSuccess(res, { data });
};

export const tenantAnalytics = async (_req: Request, res: Response) => {
  const data = await AdminService.getTenantAnalytics();
  return sendSuccess(res, { data });
};
