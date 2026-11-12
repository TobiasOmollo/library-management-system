export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExcecutionContext): boolean {
        const required = this.reflector.get<string[]>("roles", context.getHandler());
        if (!required) return true;
        const { user } = context.switchToHttp().getRequest();
        return required.include(user.role);
    }
}

@Post()
@UseGuards(JwtAuthGuard, RolesGuard);
@Roles("LIBRARIAN");
create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
}
