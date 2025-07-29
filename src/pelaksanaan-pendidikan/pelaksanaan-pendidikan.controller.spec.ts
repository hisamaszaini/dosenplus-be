import { Test, TestingModule } from '@nestjs/testing';
import { PelaksanaanPendidikanController } from './pelaksanaan-pendidikan.controller';
import { PelaksanaanPendidikanService } from './pelaksanaan-pendidikan.service';

describe('PelaksanaanPendidikanController', () => {
  let controller: PelaksanaanPendidikanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PelaksanaanPendidikanController],
      providers: [PelaksanaanPendidikanService],
    }).compile();

    controller = module.get<PelaksanaanPendidikanController>(PelaksanaanPendidikanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
