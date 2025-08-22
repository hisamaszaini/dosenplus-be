import { Test, TestingModule } from '@nestjs/testing';
import { PengabdianService } from './pengabdian.service';

describe('PengabdianService', () => {
  let service: PengabdianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PengabdianService],
    }).compile();

    service = module.get<PengabdianService>(PengabdianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
