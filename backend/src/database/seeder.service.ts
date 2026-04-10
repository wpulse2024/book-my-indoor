import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  Permission,
  PermissionDocument,
} from '../permissions/schemas/permission.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

/** All permissions that exist in the system (collected from all controllers). */
const SYSTEM_PERMISSIONS: Array<{ name: string; description: string }> = [
  // permissions resource
  { name: 'permissions:create', description: 'Create a new permission' },
  { name: 'permissions:read', description: 'List all permissions' },
  { name: 'permissions:singleRead', description: 'Read a single permission' },
  { name: 'permissions:delete', description: 'Delete a permission' },
  // auth resource
  { name: 'auth:loginAsUser', description: 'Login as any user account (admin impersonation)' },
  // roles resource
  { name: 'roles:create', description: 'Create a new role' },
  { name: 'roles:read', description: 'List all roles' },
  { name: 'roles:readNonAdmin', description: 'List all roles excluding the admin role' },
  { name: 'roles:singleRead', description: 'Read a single role' },
  { name: 'roles:update', description: 'Update a role' },
  { name: 'roles:delete', description: 'Delete a role' },
  // users resource
  { name: 'users:create', description: 'Create a new user' },
  { name: 'users:read', description: 'List all users' },
  { name: 'users:singleRead', description: 'Read a single user' },
  { name: 'users:assignRole', description: 'Assign roles to a user' },
  { name: 'users:delete', description: 'Delete a user' },
  // organizations resource
  { name: 'organizations:create', description: 'Create a new organization' },
  { name: 'organizations:read', description: 'List all organizations' },
  { name: 'organizations:singleRead', description: 'Read a single organization' },
  { name: 'organizations:update', description: 'Update an organization' },
  { name: 'organizations:delete', description: 'Delete an organization' },
];

const ADMIN_ROLE_NAME = 'admin';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PHONE = '+8801747102896';
const ADMIN_PASSWORD = '123456';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting database seed…');

    const permissions = await this.seedPermissions();
    const adminRole = await this.seedAdminRole(permissions);
    await this.seedAgentRole();
    await this.seedUserRole();
    await this.seedAdminUser(adminRole._id as any);

    this.logger.log('Seed complete.');
  }

  // ─── Permissions ────────────────────────────────────────────────────────────

  private async seedPermissions(): Promise<PermissionDocument[]> {
    this.logger.log(`Seeding ${SYSTEM_PERMISSIONS.length} permissions…`);

    const docs: PermissionDocument[] = [];

    for (const def of SYSTEM_PERMISSIONS) {
      const doc = await this.permissionModel.findOneAndUpdate(
        { name: def.name },
        { $setOnInsert: def },
        { upsert: true, new: true },
      );
      docs.push(doc!);
      this.logger.debug(`  ✔ permission: ${def.name}`);
    }

    this.logger.log(`Permissions ready (${docs.length}).`);
    return docs;
  }

  // ─── Admin role ─────────────────────────────────────────────────────────────

  private async seedAdminRole(
    permissions: PermissionDocument[],
  ): Promise<RoleDocument> {
    this.logger.log(`Seeding role: '${ADMIN_ROLE_NAME}'…`);

    const permissionIds = permissions.map((p) => p._id);

    const role = await this.roleModel.findOneAndUpdate(
      { name: ADMIN_ROLE_NAME },
      {
        $set: { permissions: permissionIds }, // always sync all permissions
        $setOnInsert: {
          name: ADMIN_ROLE_NAME,
          description: 'Super-admin with full access',
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(
      `Role '${ADMIN_ROLE_NAME}' ready with ${permissionIds.length} permissions.`,
    );
    return role!;
  }

  // ─── Agent role ─────────────────────────────────────────────────────────────

  private async seedAgentRole(): Promise<void> {
    this.logger.log(`Seeding role: 'agent'…`);

    await this.roleModel.findOneAndUpdate(
      { name: 'agent' },
      {
        $setOnInsert: {
          name: 'agent',
          description: 'Organization agent with limited access',
          permissions: [],
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(`Role 'agent' ready.`);
  }

  // ─── User role ──────────────────────────────────────────────────────────────

  private async seedUserRole(): Promise<void> {
    this.logger.log(`Seeding role: 'user'…`);

    await this.roleModel.findOneAndUpdate(
      { name: 'user' },
      {
        $setOnInsert: {
          name: 'user',
          description: 'Default role assigned to all registered end users',
          permissions: [],
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(`Role 'user' ready.`);
  }

  // ─── Admin user ─────────────────────────────────────────────────────────────

  private async seedAdminUser(roleId: any): Promise<void> {
    this.logger.log(`Seeding admin user: '${ADMIN_EMAIL}'…`);

    const existing = await this.userModel.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      // Ensure the role is always assigned even if user already existed
      await this.userModel.updateOne(
        { _id: existing._id },
        { $addToSet: { roles: roleId } },
      );
      this.logger.log(`Admin user already exists — role re-confirmed.`);
      return;
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await this.userModel.create({
      phone: ADMIN_PHONE,
      email: ADMIN_EMAIL,
      password: hashed,
      roles: [roleId],
      isActive: true,
    });

    this.logger.log(
      `Admin user created  →  email: ${ADMIN_EMAIL}  |  phone: ${ADMIN_PHONE}`,
    );
  }
}
