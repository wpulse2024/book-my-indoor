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
  // categories resource
  { name: 'categories:create', description: 'Create a new category' },
  { name: 'categories:update', description: 'Update a category' },
  { name: 'categories:delete', description: 'Delete a category' },
  // venue-features resource
  { name: 'venue-features:create', description: 'Create a new venue feature' },
  { name: 'venue-features:update', description: 'Update a venue feature' },
  { name: 'venue-features:delete', description: 'Delete a venue feature' },
  // venues resource
  { name: 'venues:adminCreate', description: 'Create a venue under any organization (admin only)' },
  { name: 'venues:adminUpdate', description: 'Update any venue regardless of organization (admin only)' },
  { name: 'venues:create', description: 'Create a new venue under own organization' },
  { name: 'venues:update', description: 'Update a venue within own organization' },
  { name: 'venues:delete', description: 'Delete a venue' },
  // staff resource (agent manages their org's staff)
  { name: 'staff:read', description: 'List staff in own organization' },
  { name: 'staff:create', description: 'Add a staff member to own organization' },
  { name: 'staff:delete', description: 'Remove a staff member from own organization' },
  // venues read (manager can view venues, agent already has create/update/delete)
  { name: 'venues:read', description: 'View venues in own organization' },
  // venue-slots resource
  { name: 'venue-slots:adminCreate', description: 'Create a slot under any organization (admin only)' },
  { name: 'venue-slots:adminUpdate', description: 'Update any slot regardless of organization (admin only)' },
  { name: 'venue-slots:adminUpdateStatus', description: 'Publish/unpublish any slot (admin only)' },
  { name: 'venue-slots:adminDelete', description: 'Delete any slot regardless of organization (admin only)' },
  { name: 'venue-slots:readAll', description: 'List all slots across all organizations (admin only)' },
  { name: 'venue-slots:bookByAgent', description: 'Book a slot for a customer (agent only)' },
  { name: 'venue-slots:book', description: 'Book a slot as an end user' },
  { name: 'venue-slots:create', description: 'Create a slot under own organization' },
  { name: 'venue-slots:readMine', description: 'View slots in own organization' },
  { name: 'venue-slots:update', description: 'Update a slot within own organization' },
  { name: 'venue-slots:updateStatus', description: 'Publish/unpublish a slot within own organization' },
  { name: 'venue-slots:delete', description: 'Delete a slot within own organization' },
  // bookings resource
  { name: 'bookings:read', description: 'View bookings in own organization' },
  { name: 'bookings:create', description: 'Create a booking' },
  { name: 'bookings:update', description: 'Update / change status of a booking' },
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
    await this.seedAgentRole(permissions);
    await this.seedManagerRole(permissions);
    await this.seedUserRole(permissions);
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

  private async seedAgentRole(permissions: PermissionDocument[]): Promise<void> {
    this.logger.log(`Seeding role: 'agent'…`);

    const agentPermissionNames = [
      'venues:create', 'venues:update', 'venues:delete',
      'venue-slots:bookByAgent',
      'venue-slots:create', 'venue-slots:readMine', 'venue-slots:update', 'venue-slots:updateStatus', 'venue-slots:delete',
      'staff:read', 'staff:create', 'staff:delete',
      'roles:readNonAdmin',
    ];
    const agentPermissionIds = permissions
      .filter((p) => agentPermissionNames.includes(p.name))
      .map((p) => p._id);

    await this.roleModel.findOneAndUpdate(
      { name: 'agent' },
      {
        $set: { permissions: agentPermissionIds },
        $setOnInsert: {
          name: 'agent',
          description: 'Organization agent with limited access',
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(`Role 'agent' ready with ${agentPermissionIds.length} permissions.`);
  }

  // ─── Manager role ───────────────────────────────────────────────────────────

  private async seedManagerRole(permissions: PermissionDocument[]): Promise<void> {
    this.logger.log(`Seeding role: 'manager'…`);

    const managerPermissionNames = [
      'venues:read',
      'bookings:read',
      'bookings:create',
      'bookings:update',
    ];
    const managerPermissionIds = permissions
      .filter((p) => managerPermissionNames.includes(p.name))
      .map((p) => p._id);

    await this.roleModel.findOneAndUpdate(
      { name: 'manager' },
      {
        $set: { permissions: managerPermissionIds },
        $setOnInsert: {
          name: 'manager',
          description: 'Can view venues and manage bookings only',
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(`Role 'manager' ready with ${managerPermissionIds.length} permissions.`);
  }

  // ─── User role ──────────────────────────────────────────────────────────────

  private async seedUserRole(permissions: PermissionDocument[]): Promise<void> {
    this.logger.log(`Seeding role: 'user'…`);

    const userPermissionNames = ['venue-slots:book'];
    const userPermissionIds = permissions
      .filter((p) => userPermissionNames.includes(p.name))
      .map((p) => p._id);

    await this.roleModel.findOneAndUpdate(
      { name: 'user' },
      {
        $set: { permissions: userPermissionIds },
        $setOnInsert: {
          name: 'user',
          description: 'Default role assigned to all registered end users',
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(`Role 'user' ready with ${userPermissionIds.length} permissions.`);
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
