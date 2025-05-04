// src/modules/teams/team.service.ts
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';
import { CreateTeamDto, UpdateTeamDto, TeamRole } from './team.dto';
import { TeamMember } from './entities/team-member.entity';

export class TeamService {
  constructor(
    private teamRepository: Repository<Team>,
    private userRepository: Repository<User>
  ) {}

  async findAll(page: number, limit: number): Promise<Team[]> {
    return this.teamRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['owner', 'members', 'members.user']
    });
  }

  async findById(id: string): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user']
    });
  }

  async create(createTeamDto: CreateTeamDto, ownerId: string): Promise<Team> {
    const owner = await this.userRepository.findOneBy({ id: ownerId });
    if (!owner) {
      throw new Error('Owner not found');
    }

    const team = this.teamRepository.create({
      ...createTeamDto,
      owner
    });

    return this.teamRepository.save(team);
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team | null> {
    const team = await this.teamRepository.findOneBy({ id });
    if (!team) return null;

    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.teamRepository.delete(id);
    return result.affected !== 0;
  }

  async addMember(teamId: string, userId: string, role: TeamRole): Promise<boolean> {
    const team = await this.teamRepository.findOneBy({ id: teamId });
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!team || !user) return false;

    const member = new TeamMember();
    member.team = team;
    member.user = user;
    member.role = role;

    await this.teamRepository.manager.save(member);
    return true;
  }
}