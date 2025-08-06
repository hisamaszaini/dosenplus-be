import { Test, TestingModule } from '@nestjs/testing';
import { PelaksanaanPendidikanService } from './pelaksanaan-pendidikan.service';

describe('PelaksanaanPendidikanService', () => {
  let service: PelaksanaanPendidikanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PelaksanaanPendidikanService],
    }).compile();

    service = module.get<PelaksanaanPendidikanService>(PelaksanaanPendidikanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
