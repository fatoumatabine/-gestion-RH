# TODO: Correct PayRunsList

## Information Gathered
- PayRunsList.tsx is a React component for listing payroll runs (payruns).
- It fetches data from `/api/payrolls/payruns/list`.
- Displays statistics, table with payruns, and actions like generate bulletins, process payments.
- Backend routes in `backend/src/routes/payrolls.js` handle payrun operations.
- The component has loading, error states, and access control for SUPERADMIN/CASHIER roles.
- Table header is defined but tbody (table body) appears to be missing from the file.

## Plan
1. **Read full PayRunsList.tsx file** - The previous read was truncated, need complete content.
2. **Identify missing parts** - Likely the table body (tbody) with rows for each payrun.
3. **Add table body implementation** - Map over payRuns array to display each payrun in table rows.
4. **Verify API endpoints** - Ensure frontend calls match backend routes.
5. **Fix any errors** - Check for syntax errors, missing imports, or logic issues.
6. **Add pagination support** - Backend returns pagination data, frontend should use it.
7. **Test functionality** - Ensure buttons and actions work correctly.

## Dependent Files to be edited
- `front/src/pages/Payrolls/PayRunsList.tsx` - Main component file
- Possibly check `backend/src/routes/payrolls.js` if API issues found

## Followup steps
- Run the frontend to test the corrected component.
- Check console for any errors.
- Verify that payruns load and display correctly.
- Test actions like generate and process payments.
