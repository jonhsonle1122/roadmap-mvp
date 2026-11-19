import { RoadmapItem } from './types';

export const ROADMAP_ITEMS: Record<string, RoadmapItem> = {
  'system-design': {
    id: 'system-design',
    title: 'System Design Mastery',
    description: 'Thiết kế hệ thống phân tán quy mô lớn từ Donne Martin Primer: từ 1 đến 10 triệu users.',
    badge: 'FAANG Ready',
    nodes: [
      // --- Cột 1: Nền tảng cốt lõi (x: 50) ---
      {
        id: 'perf-vs-scale',
        label: 'Performance vs Scalability',
        level: 'Cơ bản',
        categoryTitle: '1. Nền Tảng Cốt Lõi',
        estTime: '30 phút',
        summary: 'Tối ưu tốc độ của 1 máy (Performance) vs năng lực mở rộng khi tải tăng (Scalability).',
        content: `### 1. Phân biệt:
- **Performance:** Xử lý 1 request nhanh thế nào (tối ưu thuật toán, đánh index DB).
- **Scalability:** Khả năng duy trì hiệu năng khi tải tăng 10x, 100x, 1000x.

### 2. Hai hướng Scale:
- **Vertical Scaling (Scale Up):** Tăng RAM, CPU máy chủ hiện tại. Đơn giản nhưng có trần vật lý và gây SPOF.
- **Horizontal Scaling (Scale Out):** Thêm nhiều máy chủ chạy song song qua Load Balancer. Không giới hạn trần nhưng đòi hỏi kiến trúc Stateless.`,
        prosCons: {
          pros: ['Scale Up nhanh gọn cho giai đoạn MVP', 'Scale Out đem lại tính dự phòng cao'],
          cons: ['Scale Up có trần phần cứng', 'Scale Out quản lý phân tán phức tạp']
        },
        questions: ['Một hệ thống xử lý 1 request mất 2s nhưng chịu được 100k req/s thì là Scalable hay Performant?'],
        position: { x: 50, y: 50 }
      },
      {
        id: 'latency-vs-throughput',
        label: 'Latency vs Throughput',
        level: 'Cơ bản',
        categoryTitle: '1. Nền Tảng Cốt Lõi',
        estTime: '25 phút',
        summary: 'Mối quan hệ giữa độ trễ một tác vụ và số lượng tác vụ xử lý trong một đơn vị thời gian.',
        content: `### Khái niệm:
- **Latency:** Thời gian cần thiết để xử lý 1 request (ms).
- **Throughput:** Số request hệ thống xử lý trong 1 giây (RPS / QPS).
- Định luật Little: L = λ * W.`,
        prosCons: {
          pros: ['Xác định rõ SLA / SLO cho từng API'],
          cons: ['Cơ chế Batching tăng throughput nhưng làm tăng độ trễ từng item']
        },
        questions: ['Tại sao khi hệ thống quá tải thì Latency lại tăng vọt theo hàm mũ?'],
        position: { x: 50, y: 180 }
      },
      {
        id: 'cap-theorem',
        label: 'Định lý CAP & Consistency',
        level: 'Cốt lõi',
        categoryTitle: '1. Nền Tảng Cốt Lõi',
        estTime: '40 phút',
        summary: 'Khi mạng phân tán bị đứt (Partition), chỉ có thể chọn Consistency (CP) hoặc Availability (AP).',
        content: `### 3 Yếu tố CAP:
1. **Consistency (C):** Mọi node đều đọc được dữ liệu mới nhất.
2. **Availability (A):** Mọi request đều nhận được phản hồi thành công.
3. **Partition Tolerance (P):** Hệ thống vẫn sống khi mạng đứt.

> Trong thực tế, **P luôn xảy ra**, bạn buộc phải chọn giữa **CP** (Ngân hàng, tài chính) hoặc **AP** (Social feeds, video views).`,
        prosCons: {
          pros: ['Cơ sở chuẩn xác để chọn loại database phù hợp'],
          cons: ['Strong Consistency làm chậm hệ thống ở quy mô lớn']
        },
        questions: ['Hệ thống đặt xe công nghệ (Grab, Uber) nên ưu tiên AP hay CP khi xem vị trí tài xế?'],
        position: { x: 50, y: 310 }
      },
      {
        id: 'ha-failover',
        label: 'High Availability & Failover',
        level: 'Cốt lõi',
        categoryTitle: '1. Nền Tảng Cốt Lõi',
        estTime: '30 phút',
        summary: 'Triệt tiêu SPOF với mô hình Active-Passive, Active-Active và công thức tính "số 9".',
        content: `### Single Point of Failure (SPOF):
Mục tiêu số 1 của System Design là triệt tiêu toàn bộ điểm nghẽn đơn độc.
- **Active-Passive:** 1 máy chạy, 1 máy ngủ chờ thay thế khi máy chính chết.
- **Active-Active:** Cả 2 máy cùng chia tải.
- Chuẩn 99.99% (4 số 9) = Sập không quá 52.6 phút / năm.`,
        prosCons: {
          pros: ['Hệ thống uptime 24/7 không gián đoạn'],
          cons: ['Chi phí duy trì máy chủ dự phòng tăng gấp đôi']
        },
        questions: ['RTO và RPO trong kịch bản Disaster Recovery là gì?'],
        position: { x: 50, y: 440 }
      },

      // --- Cột 2: Hạ tầng & Caching (x: 380) ---
      {
        id: 'dns-cdn',
        label: 'DNS & CDN Caching',
        level: 'Cơ bản',
        categoryTitle: '2. Các Khối Hạ Tầng',
        estTime: '30 phút',
        summary: 'Định tuyến GeoDNS và phân phối nội dung tĩnh qua Push/Pull CDN.',
        content: `### CDN (Content Delivery Network):
- **Pull CDN:** Kéo dữ liệu từ Origin Server khi có người đầu tiên request, sau đó cache lại ở Edge gần user nhất (Cloudflare).
- **Push CDN:** Chủ động tải toàn bộ tài sản lên CDN trước. Phù hợp file cài đặt game lớn.`,
        prosCons: {
          pros: ['Giảm tải 80%+ cho máy chủ gốc', 'Trang load siêu nhanh toàn cầu'],
          cons: ['Khó khăn khi cần xóa cache khẩn cấp (Purge Cache)']
        },
        position: { x: 380, y: 50 }
      },
      {
        id: 'load-balancer',
        label: 'Load Balancer (L4 vs L7)',
        level: 'Cốt lõi',
        categoryTitle: '2. Các Khối Hạ Tầng',
        estTime: '40 phút',
        summary: 'Phân phối tải, SSL Termination và các thuật toán Round-Robin, Least Connections.',
        content: `### Phân biệt:
- **Layer 4:** Cân bằng tải theo IP/Port (TCP/UDP), cực nhanh.
- **Layer 7:** Đọc URL path, Cookies, Headers để định tuyến thông minh sang từng Microservice.`,
        prosCons: {
          pros: ['Tự động loại bỏ server chết qua Health Checks'],
          cons: ['Cần thiết lập cụm HA cho chính Load Balancer']
        },
        position: { x: 380, y: 180 }
      },
      {
        id: 'caching-strategies',
        label: 'Chiến Lược Caching (Redis)',
        level: 'Cốt lõi',
        categoryTitle: '2. Các Khối Hạ Tầng',
        estTime: '45 phút',
        summary: 'Bốn chiến lược Cache-Aside, Write-Through, Write-Behind và phòng ngừa Cache Avalanche.',
        content: `### 4 Chiến lược:
1. **Cache-Aside:** App query Cache trước, Miss thì vào DB rồi lưu Cache.
2. **Write-Through:** Ghi đồng thời vào Cache và DB.
3. **Write-Behind:** Ghi vào Cache, gom batch rồi ghi DB nền (siêu nhanh nhưng dễ mất dữ liệu nếu cache chết).
4. **Refresh-Ahead:** Tự động reload trước khi key hết hạn.`,
        prosCons: {
          pros: ['Độ trễ đọc dữ liệu dưới 1ms bằng RAM Redis'],
          cons: ['Vấn đề Cache Invalidation và Cache Stampede']
        },
        position: { x: 380, y: 310 }
      },
      {
        id: 'db-scaling',
        label: 'Database Sharding & Replica',
        level: 'Nâng cao',
        categoryTitle: '2. Các Khối Hạ Tầng',
        estTime: '50 phút',
        summary: 'Master-Slave Replication, Sharding ngang theo Shard Key và lựa chọn SQL vs NoSQL.',
        content: `### Kỹ thuật scale DB:
- **Read Replicas:** 1 Master ghi, N Slave đọc.
- **Sharding:** Tách bảng lớn thành nhiều DB theo user_id.
- **Consistent Hashing:** Giảm thiểu việc dịch chuyển dữ liệu khi thêm/bớt Shard.`,
        prosCons: {
          pros: ['Chứa được hàng tỷ bản ghi và hàng trăm ngàn QPS'],
          cons: ['Rất khó thực hiện JOIN đa bảng giữa các Shard']
        },
        position: { x: 380, y: 440 }
      },

      // --- Cột 3: Bất đồng bộ & Case Studies (x: 710) ---
      {
        id: 'async-queues',
        label: 'Message Queues (Kafka/RabbitMQ)',
        level: 'Cốt lõi',
        categoryTitle: '3. Xử Lý Bất Đồng Bộ',
        estTime: '35 phút',
        summary: 'Tách rời các service, xử lý tác vụ nặng qua Background Worker và cơ chế Backpressure.',
        content: `### Tại sao cần Message Queue:
Giải phóng kết nối HTTP tức thì bằng phản hồi \`202 Accepted\`.
Worker xử lý các tác vụ như gửi mail, nén video, gọi AI phía sau.
Backpressure giúp bảo vệ database khỏi bị sập khi có traffic spike.`,
        prosCons: {
          pros: ['Hệ thống đàn hồi cao, không bị quá tải đột ngột'],
          cons: ['Tăng độ phức tạp khi giám sát luồng chạy nền']
        },
        position: { x: 710, y: 50 }
      },
      {
        id: 'case-scaling-aws',
        label: 'Case: Scale 1 -> 10M Users AWS',
        level: 'Thực chiến',
        categoryTitle: '4. Case Studies Thực Chiến',
        estTime: '60 phút',
        summary: 'Toàn bộ tiến trình tiến hóa kiến trúc từ 1 máy ảo EC2 đến hạ tầng đa vùng (Multi-Region).',
        content: `### Lộ trình:
1. 1 user: 1 EC2 duy nhất.
2. 1k users: Tách RDS, thêm ELB.
3. 10k users: Thêm CDN CloudFront, RDS Read Replicas.
4. 100k users: Thêm Redis ElastiCache, SQS Queue.
5. 1M+ users: Microservices, Auto-scaling.
6. 10M+ users: Multi-region Sharding.`,
        prosCons: {
          pros: ['Bức tranh tổng thể hoàn hảo cho mọi startup'],
          cons: ['Cần kiểm soát chi phí điện toán đám mây']
        },
        position: { x: 710, y: 180 }
      },
      {
        id: 'case-pastebin',
        label: 'Case: URL Shortener / Pastebin',
        level: 'Thực chiến',
        categoryTitle: '4. Case Studies Thực Chiến',
        estTime: '45 phút',
        summary: 'Tính toán dung lượng, thuật toán sinh mã băm Base62 và Key-Generation Service.',
        content: `### Bài toán:
100 triệu link/tháng -> 40 ghi/s, 4.000 đọc/s.
10 năm cần 6TB ổ đĩa.
Dùng Base62 sinh chuỗi 7 ký tự (hỗ trợ 3.5 nghìn tỷ link độc nhất).
Chuẩn bị Key Generation Service sinh trước các ID ngẫu nhiên.`,
        prosCons: {
          pros: ['Kiến trúc nhỏ gọn, tối ưu cache đọc bằng quy tắc 80/20'],
          cons: ['Cần cơ chế xoá link rác tự động']
        },
        position: { x: 710, y: 310 }
      },
      {
        id: 'case-twitter',
        label: 'Case: Twitter Timeline & Feed',
        level: 'Nâng cao',
        categoryTitle: '4. Case Studies Thực Chiến',
        estTime: '60 phút',
        summary: 'Fan-out on Write vs Fan-out on Read và cách xử lý tài khoản người nổi tiếng (Celebrity Problem).',
        content: `### News Feed Architecture:
- Fan-out on Write: Đẩy tweet vào timeline cache của mọi followers ngay khi tweet được tạo.
- Người nổi tiếng (>100k followers): Dùng cơ chế Fan-out on Read để tránh nghẽn hàng triệu thao tác ghi vào Redis.`,
        prosCons: {
          pros: ['Bảng tin tải tức thì trong vài chục mili-giây'],
          cons: ['Chi phí RAM Redis cực lớn']
        },
        position: { x: 710, y: 440 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'perf-vs-scale', target: 'latency-vs-throughput', animated: true },
      { id: 'e2-3', source: 'latency-vs-throughput', target: 'cap-theorem', animated: true },
      { id: 'e3-4', source: 'cap-theorem', target: 'ha-failover' },
      
      { id: 'e1-5', source: 'perf-vs-scale', target: 'dns-cdn' },
      { id: 'e5-6', source: 'dns-cdn', target: 'load-balancer', animated: true },
      { id: 'e6-7', source: 'load-balancer', target: 'caching-strategies', animated: true },
      { id: 'e7-8', source: 'caching-strategies', target: 'db-scaling' },

      { id: 'e6-9', source: 'load-balancer', target: 'async-queues' },
      { id: 'e9-10', source: 'async-queues', target: 'case-scaling-aws', animated: true },
      { id: 'e10-11', source: 'case-scaling-aws', target: 'case-pastebin' },
      { id: 'e11-12', source: 'case-pastebin', target: 'case-twitter', animated: true },
    ]
  },

  'backend': {
    id: 'backend',
    title: 'Backend Developer Roadmap',
    description: 'Lộ trình phát triển Backend: Internet, API, Cơ sở dữ liệu và Kiến trúc Microservices.',
    badge: 'Popular',
    nodes: [
      {
        id: 'b-net',
        label: 'Internet & HTTP/3 (QUIC)',
        level: 'Cơ bản',
        categoryTitle: '1. Nền Tảng Mạng',
        summary: 'Bắt tay TCP 3 bước, TLS 1.3 và cơ chế Client-Server.',
        content: 'Tìm hiểu chi tiết cách một request di chuyển từ DNS, TCP Handshake đến Web Server.',
        position: { x: 100, y: 80 }
      },
      {
        id: 'b-api',
        label: 'RESTful API & gRPC',
        level: 'Cốt lõi',
        categoryTitle: '2. Xây Dựng API',
        summary: 'Thiết kế REST API chuẩn, gRPC Protobuf và GraphQL.',
        content: 'Quy chuẩn Idempotency, Status code, Token JWT và tối ưu payload binary.',
        position: { x: 100, y: 220 }
      },
      {
        id: 'b-sql',
        label: 'PostgreSQL & Indexing',
        level: 'Cốt lõi',
        categoryTitle: '3. Cơ Sở Dữ Liệu',
        summary: 'B-Tree Index, Composite Index, ACID Transactions và N+1 Query.',
        content: 'Tối ưu truy vấn SQL, phân tích EXPLAIN ANALYZE và quản lý Connection Pooling.',
        position: { x: 420, y: 150 }
      }
    ],
    edges: [
      { id: 'eb-1-2', source: 'b-net', target: 'b-api', animated: true },
      { id: 'eb-2-3', source: 'b-api', target: 'b-sql', animated: true }
    ]
  }
};
