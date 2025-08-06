import { Test, TestingModule } from '@nestjs/testing';
import { PendidikanService } from './pendidikan.service';

describe('PendidikanService', () => {
  let service: PendidikanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendidikanService],
    }).compile();

    service = module.get<PendidikanService>(PendidikanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
