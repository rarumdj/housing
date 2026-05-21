import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as AdminService from './service';

// ── Users ──

export async function listUsers(req: Request, res: Response) {
  const result = await AdminService.listUsers(req.query as Record<string, unknown>);
  return res.status(200).json({ success: true, error: false, ...result });
}

export async function getUserDetail(req: Request, res: Response) {
  const data = await AdminService.getUserDetail(req.params.id);
  return sendSuccess(res, { data });
}

export async function verifyUser(req: Request, res: Response) {
  const data = await AdminService.verifyUser(req.params.id, req.body.status, req.body.reason);
  return sendSuccess(res, { data, message: 'User verification updated' });
}

export async function toggleUserActive(req: Request, res: Response) {
  const data = await AdminService.toggleUserActive(req.params.id);
  return sendSuccess(res, { data, message: 'User status toggled' });
}

// ── Properties ──

export async function listProperties(req: Request, res: Response) {
  const result = await AdminService.listProperties(req.query as Record<string, unknown>);
  return res.status(200).json({ success: true, error: false, ...result });
}

export async function verifyProperty(req: Request, res: Response) {
  const data = await AdminService.verifyProperty(req.params.id, req.body.verificationStatus, req.body.reason);
  return sendSuccess(res, { data, message: 'Property verification updated' });
}

export async function deleteProperty(req: Request, res: Response) {
  await AdminService.deleteProperty(req.params.id);
  return sendSuccess(res, { message: 'Property archived' });
}

// ── Fees ──

export async function listFees(_req: Request, res: Response) {
  const data = await AdminService.listFees();
  return sendSuccess(res, { data });
}

export async function createFee(req: Request, res: Response) {
  const data = await AdminService.createFee(req.body);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function updateFee(req: Request, res: Response) {
  const data = await AdminService.updateFee(req.params.id, req.body);
  return sendSuccess(res, { data });
}

export async function deleteFee(req: Request, res: Response) {
  await AdminService.deleteFee(req.params.id);
  return sendSuccess(res, { message: 'Fee deleted' });
}

// ── Analytics ──

export async function overview(_req: Request, res: Response) {
  const data = await AdminService.getOverview();
  return sendSuccess(res, { data });
}

export async function revenue(_req: Request, res: Response) {
  const data = await AdminService.getRevenueAnalytics();
  return sendSuccess(res, { data });
}

export async function landlordAnalytics(_req: Request, res: Response) {
  const data = await AdminService.getLandlordAnalytics();
  return sendSuccess(res, { data });
}

export async function tenantAnalytics(_req: Request, res: Response) {
  const data = await AdminService.getTenantAnalytics();
  return sendSuccess(res, { data });
}
