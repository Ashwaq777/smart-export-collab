export const MARITIME_COUNTRIES = [
  'MA','DZ','TN','EG','LY','MR','SN','GM','GW','SL','LR','CI','GH',
  'TG','BJ','NG','CM','GQ','GA','CG','CD','AO','NA','ZA','MZ','TZ',
  'KE','SO','DJ','ER','SD','ET','MG','MU','SC','KM','FR','ES','PT',
  'IT','GR','HR','ME','AL','TR','LB','IL','PS','JO','SA','YE','OM',
  'AE','QA','KW','IQ','IR','PK','IN','LK','BD','MM','TH','MY','SG',
  'ID','PH','VN','KH','CN','JP','KR','TW','AU','NZ','FJ','PG','US',
  'MX','GT','BZ','HN','SV','NI','CR','PA','CO','VE','GY','SR','BR',
  'UY','AR','CL','PE','EC','DE','NL','BE','GB','IE','DK','NO','SE',
  'FI','EE','LV','LT','PL','RU','UA','RO','BG','SI','BA','MK','CY',
  'MT','IS','CA','CU','JM','HT','DO','PR','TT','BB','LC','VC','GD',
  'AG','KN','BS','TC','NL','MV','BH','PW','MH','FM','WS','TO','VU',
]

export const MARITIME_COUNTRIES_ISO2 = new Set(MARITIME_COUNTRIES)

export const isMaritimeCountryIso2 = (iso2) => {
  if (!iso2) return false
  return MARITIME_COUNTRIES_ISO2.has(String(iso2).toUpperCase())
}
