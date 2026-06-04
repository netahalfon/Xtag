-- payroll_report_v3: same as v2 + total_hours (sum) and total_shifts (count)
-- Counts only approved shifts within [from_date, to_date), grouped per worker.
create or replace function payroll_report_v3(from_date date, to_date date)
returns table (
  full_name text,
  phone text,
  email text,
  id_number text,
  employee_number bigint,
  bank_account_number text,
  bank_name text,
  bank_branch_number text,
  amount_to_pay numeric,
  travel_sum numeric,
  total_sum numeric,
  total_hours numeric,
  total_shifts bigint
)
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  ) then
    raise exception 'forbidden';
  end if;

  return query
  select
    u.full_name,
    u.phone,
    u.email,
    u.id_number,
    u.employee_number,
    u.bank_account_number,
    u.bank_name,
    u.bank_branch_number,
    coalesce(sum(s.shift_pay_total),0) - coalesce(sum(s.travel_amount),0) as amount_to_pay,
    coalesce(sum(s.travel_amount),0) as travel_sum,
    coalesce(sum(s.shift_pay_total),0) as total_sum,
    coalesce(sum(s.total_hours),0) as total_hours,
    count(s.id) as total_shifts
  from public.shifts s
  join public.users u on u.id = s.worker_id
  where s.shift_date >= from_date
    and s.shift_date < to_date
    and s.status = 'approved'
  group by
    u.full_name,
    u.phone,
    u.email,
    u.id_number,
    u.employee_number,
    u.bank_account_number,
    u.bank_name,
    u.bank_branch_number
  order by u.full_name;
end;
$$;
